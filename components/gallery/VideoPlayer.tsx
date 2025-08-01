import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

export default function VideoPlayer({
  isOpen,
  onClose,
  videoUrl,
  title = "Video Player"
}: {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  title?: string
}) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsLoading(true);
      console.log('Video URL:', videoUrl); // Debug log
      
      if (!videoUrl) {
        setError('No video URL provided');
        setIsLoading(false);
        return;
      }
      
      // Check if the video can be played
      const video = document.createElement('video');
      video.src = videoUrl;
      
      const handleError = () => {
        console.error('Video error:', video.error);
        setError('Failed to load video. Please check the URL and try again.');
        setIsLoading(false);
      };
      
      const handleCanPlay = () => {
        console.log('Video can be played');
        setIsLoading(false);
      };
      
      video.addEventListener('error', handleError);
      video.addEventListener('canplay', handleCanPlay);
      
      return () => {
        video.removeEventListener('error', handleError);
        video.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, [isOpen, videoUrl]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="relative pt-[56.25%] w-full bg-black">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
          
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Error Loading Video</h3>
              <p className="text-gray-300">{error}</p>
              <p className="text-sm text-gray-400 mt-2">URL: {videoUrl || 'Not provided'}</p>
            </div>
          ) : (
            <video
              key={videoUrl} // Force re-render when URL changes
              src={videoUrl}
              controls
              autoPlay
              className={`absolute inset-0 w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              title={title}
              onError={(e) => {
                console.error('Video element error:', e);
                setError('This video format is not supported or the file is corrupted.');
                setIsLoading(false);
              }}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
