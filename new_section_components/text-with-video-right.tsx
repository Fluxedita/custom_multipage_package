import { Button } from "@/components/ui/button"
import { PlayCircle } from "lucide-react"

interface TextWithVideoRightProps {
  title: string
  tagline: string
  description: string
  videoId: string
  buttonText?: string
  onPlayClick?: () => void
  ctaText?: string;
  ctaUrl?: string;
  isEditMode?: boolean;
  onSectionChange?: (section: any) => void;
}

export function TextWithVideoRight({
  title,
  tagline,
  description,
  videoId,
  buttonText = 'Watch Tutorial',
  onPlayClick,
  ctaText = 'Learn More',
  ctaUrl = '#',
  isEditMode = false,
  onSectionChange
}: TextWithVideoRightProps) {
  if (isEditMode && onSectionChange) {
    return (
      <div className="flex flex-col md:flex-row items-center gap-12 mb-24 last:mb-0">
        <div className="md:w-1/2">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-lg bg-blue-50 mr-3">
              <PlayCircle className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-600">{tagline}</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-gray-600 text-lg mb-6">{description}</p>
          <Button 
            variant="outline" 
            className="group mb-2"
            onClick={onPlayClick}
          >
            <PlayCircle className="w-5 h-5 mr-2 group-hover:text-blue-600 transition-colors" />
            {buttonText}
          </Button>
          <div className="mb-2">
            <label className="block text-xs font-medium mb-1">CTA Button Label</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 mb-2"
              value={ctaText}
              onChange={e => onSectionChange({ ctaText: e.target.value })}
              placeholder="Learn More"
            />
            <label className="block text-xs font-medium mb-1">CTA Button Link</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1"
              value={ctaUrl}
              onChange={e => onSectionChange({ ctaUrl: e.target.value })}
              placeholder="/contact"
            />
          </div>
          <a href={ctaUrl} className="inline-block">
            <Button size="lg" className="bg-blue-600 text-white w-full mt-2">
              {ctaText}
            </Button>
          </a>
        </div>
        <div className="md:w-1/2 w-full rounded-xl overflow-hidden shadow-xl">
          <div className="aspect-video">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col md:flex-row items-center gap-12 mb-24 last:mb-0">
      {/* Content */}
      <div className="md:w-1/2">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-lg bg-blue-50 mr-3">
            <PlayCircle className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-blue-600">{tagline}</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 text-lg mb-6">{description}</p>
        <Button 
          variant="outline" 
          className="group mb-2"
          onClick={onPlayClick}
        >
          <PlayCircle className="w-5 h-5 mr-2 group-hover:text-blue-600 transition-colors" />
          {buttonText}
        </Button>
        <a href={ctaUrl} className="inline-block">
          <Button size="lg" className="bg-blue-600 text-white w-full mt-2">
            {ctaText}
          </Button>
        </a>
      </div>
      {/* Video Placeholder */}
      <div className="md:w-1/2 w-full rounded-xl overflow-hidden shadow-xl">
        <div className="aspect-video">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
