'use client';

import { useEffect, useRef, useState } from 'react';
import { PlayCircle, Loader2 } from 'lucide-react';

interface VideoThumbnailProps {
  src: string;
  alt: string;
  className?: string;
}

export function VideoThumbnail({ src, alt, className }: VideoThumbnailProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      setError(true);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const generateThumbnail = () => {
      try {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setThumbnailUrl(dataUrl);
      } catch (e) {
        console.error("Error generating thumbnail:", e);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    const onLoadedData = () => {
      // a short delay before seeking, which can help with some browsers
      setTimeout(() => {
        video.currentTime = 1;
      }, 200);
    }
    
    const onSeeked = () => {
        generateThumbnail();
    }

    const onError = () => {
      console.error("Error loading video for thumbnail generation:", src);
      setError(true);
      setIsLoading(false);
    };
    
    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);

    video.crossOrigin = "anonymous";
    video.src = src;

    return () => {
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
    };
  }, [src]);

  return (
    <div className={`relative w-full h-full flex items-center justify-center bg-black overflow-hidden ${className}`}>
      <video ref={videoRef} muted playsInline style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {isLoading && <Loader2 className="h-10 w-10 text-white animate-spin" />}
      
      {thumbnailUrl && !error && (
        <img src={thumbnailUrl} alt={alt} className="object-cover w-full h-full" />
      )}
      
      {!isLoading && error && (
          <div className="flex flex-col items-center text-white/70">
            <PlayCircle className="h-10 w-10" />
            <span className="text-xs mt-1">Cannot load preview</span>
          </div>
      )}

      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <PlayCircle className="h-16 w-16 text-white" />
      </div>
    </div>
  );
} 