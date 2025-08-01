"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Edit, Tag, Volume2, VolumeX, Maximize, Pause, Play, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { MediaItem, SaveMediaData } from "@/lib/types"
import { useAuth } from "@/components/providers/AuthProvider"
import MediaDialog from "./MediaDialog"
import { useParams } from "next/navigation"
import { getVideoBySlug } from "@/lib/gallery-service"

import { format } from "date-fns"

interface VideoDetailPageProps {
  video: MediaItem;
  onUpdateAction?: (data: SaveMediaData) => Promise<{ success: boolean; data?: MediaItem; error?: string }>;
}

export default function VideoDetailPage({ video: initialVideo, onUpdateAction }: VideoDetailPageProps) {
  'use client';
  const params = useParams();
  const [video, setVideo] = useState<MediaItem>(initialVideo);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isAdmin } = useAuth();

  // Update video state when initialVideo changes
  useEffect(() => {
    if (initialVideo) {
      setVideo(initialVideo);
    }
  }, [initialVideo]);

  const togglePlay = async () => {
    if (!videoRef.current) return;
    try {
      if (isPlaying) {
        await videoRef.current.pause();
      } else {
        await videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (err) {
      console.error('Error toggling play:', err);
      setError('Failed to play video. Please try again.');
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const errorEvent = e.nativeEvent as ErrorEvent;
    console.error('Video error:', errorEvent);
    setError('Failed to load video. Please try again later.');
    setIsLoading(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number.parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSaveEdit = async (data: SaveMediaData) => {
    try {
      const resp = await fetch('/api/media/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        ...data,
        id: video.id
      })
      });
      const result: { success: boolean; data?: MediaItem; error?: string } = await resp.json();
      if (result.success && result.data) {
        setVideo(result.data);
        setIsEditDialogOpen(false);
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Error updating video:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update video' 
      };
    }
  };

  const handleSave = async (formData: SaveMediaData) => {
    try {
      if (!onUpdateAction) {
        return { success: false, error: 'Update action not provided' };
      }
      
      const result = await onUpdateAction(formData);
      
      if (result?.success && result.data) {
        setVideo(result.data);
        return { success: true, data: result.data };
      }
      
      return result || { success: false, error: 'Update failed' };
    } catch (error) {
      console.error('Error updating media:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update media' 
      };
    }
  }

  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      videoElement.addEventListener("timeupdate", handleTimeUpdate);
      videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.addEventListener("error", handleError as unknown as EventListener);

      return () => {
        videoElement.removeEventListener("timeupdate", handleTimeUpdate);
        videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
        videoElement.removeEventListener("error", handleError as unknown as EventListener);
      };
    }
  }, []);

  return (
    <div className="relative w-full">
      <div className="relative aspect-video bg-black">
        {video.videoUrl ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full"
              src={video.videoUrl}
              poster={video.coverImage}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onError={handleError}
              playsInline
            />
            
            {/* Play Button Overlay */}
            {!isPlaying && !isLoading && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="bg-white/20 backdrop-blur-sm rounded-full p-4 cursor-pointer"
                  onClick={togglePlay}
                >
                  <Play className="h-12 w-12 text-white" />
                </motion.div>
              </div>
            )}

            {/* Controls/Overlay Section */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8"
                  onClick={togglePlay}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-grow h-1 bg-white/30 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  disabled={isLoading}
                />
                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8"
                  onClick={toggleMute}
                  disabled={isLoading}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8"
                  onClick={handleFullscreen}
                  disabled={isLoading}
                >
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white">
              <p className="text-lg font-medium mb-2">No video URL available</p>
            </div>
          </div>
        )}
      </div>

      <Separator className="my-8" />

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4">About this video</h2>
          <p className="text-gray-600">{video?.description}</p>

          {/* This would be where additional text snippets could be added */}
          <div className="mt-6 space-y-4">
            <p className="text-gray-600">
              This video was shot in London during the summer of 2023. It captures the essence of my creative process
              and showcases some of my favorite moments from the season.
            </p>
            <p className="text-gray-600">
              Special thanks to everyone who helped make this possible. Your support means everything to me.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Details</h2>
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Published</h3>
              <p>{video?.createdAt ? format(new Date(video.createdAt), 'MMMM d, yyyy') : 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
              <p>{video?.updatedAt ? format(new Date(video.updatedAt), 'MMMM d, yyyy') : 'N/A'}</p>
            </div>
            {video?.tags && video.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tags</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {video.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
