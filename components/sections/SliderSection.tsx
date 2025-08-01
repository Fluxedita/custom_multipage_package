import React, { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import Image from 'next/image';
import { Volume2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MediaLibrary from '@/components/media/MediaLibrary';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface Slide {
  id: string;
  type: 'image' | 'video';
  url: string;
  title?: string;
  description?: string;
  ctaText?: string;
  ctaUrl?: string;
}

interface SliderSectionProps {
  section: {
    id: string;
    type: 'slider';
    slides?: Slide[];
    autoplay?: boolean;
    autoplayDelay?: number;
    effect?: 'slide' | 'fade';
    height?: string;
    enableTitleSpeech?: boolean;
    enableDescriptionSpeech?: boolean;
    [key: string]: any; // Allow additional properties
  };
  isEditMode: boolean;
  onSectionChange: (section: any) => void;
  speakText?: (text: string) => void;
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function SliderSection({ 
  section, 
  isEditMode, 
  onSectionChange, 
  speakText,
  onRemove,
  onMoveUp,
  onMoveDown
}: SliderSectionProps) {
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const swiperRef = useRef<any>(null);

  const handleSwiperChange = (swiper: any) => {
    setCurrentSlideIndex(swiper.activeIndex);
  };

  const handleAddSlide = (url: string, type: 'image' | 'video') => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      type,
      url,
      title: '',
      description: '',
    };
    onSectionChange({
      ...section,
      slides: [...(section.slides || []), newSlide],
    });
  };

  const handleSlideContentChange = (index: number, field: keyof Slide, value: string) => {
    if (!section.slides) return;
    
    const updatedSlides = [...section.slides];
    updatedSlides[index] = {
      ...updatedSlides[index],
      [field]: value,
    };
    onSectionChange({
      ...section,
      slides: updatedSlides,
    });
  };

  const handleRemoveSlide = (index: number) => {
    const currentSlides = section.slides || [];
    const updatedSlides = currentSlides.filter((_, i) => i !== index);
    onSectionChange({
      ...section,
      slides: updatedSlides,
    });
  };

  const renderSlide = (slide: Slide, index: number) => {
    if (isEditMode) {
      return (
        <div className="relative h-full">
          <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg w-full max-w-md">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={slide.title || ''}
                    onChange={(e) => handleSlideContentChange(index, 'title', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={slide.description || ''}
                    onChange={(e) => handleSlideContentChange(index, 'description', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CTA Text</label>
                  <input
                    type="text"
                    value={slide.ctaText || ''}
                    onChange={(e) => handleSlideContentChange(index, 'ctaText', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CTA URL</label>
                  <input
                    type="text"
                    value={slide.ctaUrl || ''}
                    onChange={(e) => handleSlideContentChange(index, 'ctaUrl', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="flex justify-between">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveSlide(index)}
                  >
                    Remove Slide
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentSlideIndex(index);
                      setMediaDialogOpen(true);
                    }}
                  >
                    Change Media
                  </Button>
                </div>
              </div>
            </div>
          </div>
          {slide.type === 'video' ? (
            <video
              src={slide.url}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
            />
          ) : (
            <Image
              src={slide.url}
              alt={slide.title || ''}
              fill
              className="object-cover"
            />
          )}
        </div>
      );
    }

    return (
      <div className="relative h-full">
        {slide.type === 'video' ? (
          <video
            src={slide.url}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <Image
            src={slide.url}
            alt={slide.title || ''}
            fill
            className="object-cover"
          />
        )}
        {(slide.title || slide.description || slide.ctaUrl) && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="text-center text-white max-w-2xl px-4">
              {slide.title && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <h2 className="text-4xl font-bold">{slide.title}</h2>
                  {section.enableTitleSpeech && speakText && (
                    <button
                      onMouseEnter={() => speakText(slide.title!)}
                      className="text-white hover:text-gray-200"
                    >
                      <Volume2Icon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}
              {slide.description && (
                <div className="flex items-center justify-center gap-2 mb-6">
                  <p className="text-xl">{slide.description}</p>
                  {section.enableDescriptionSpeech && speakText && (
                    <button
                      onMouseEnter={() => speakText(slide.description!)}
                      className="text-white hover:text-gray-200"
                    >
                      <Volume2Icon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}
              {slide.ctaUrl && (
                <Button asChild className="bg-white text-black hover:bg-gray-100">
                  <a href={slide.ctaUrl} target="_blank" rel="noopener noreferrer">
                    {slide.ctaText || 'Learn More'}
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="relative w-full" 
      style={{ 
        height: section.height || '70vh',
        paddingTop: `${section.verticalPadding ?? 0}rem`,
        paddingBottom: `${section.verticalPadding ?? 0}rem`,
        paddingLeft: `${section.horizontalPadding ?? 0}rem`,
        paddingRight: `${section.horizontalPadding ?? 0}rem`
      }}
    >
      {isEditMode && (
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="bg-white/90 p-2 rounded-md shadow-md">
              <label className="block text-xs text-gray-700 mb-1">Vert. Padding</label>
              <input
                type="number"
                min={0}
                step={0.25}
                value={section.verticalPadding ?? 0}
                onChange={(e) => onSectionChange({ ...section, verticalPadding: Number(e.target.value) })}
                className="w-16 border rounded px-1 text-sm"
              />
            </div>
            <div className="bg-white/90 p-2 rounded-md shadow-md">
              <label className="block text-xs text-gray-700 mb-1">Horiz. Padding</label>
              <input
                type="number"
                min={0}
                step={0.25}
                value={section.horizontalPadding ?? 0}
                onChange={(e) => onSectionChange({ ...section, horizontalPadding: Number(e.target.value) })}
                className="w-16 border rounded px-1 text-sm"
              />
            </div>
          </div>
          <Button
            onClick={() => setMediaDialogOpen(true)}
            className="bg-white text-black hover:bg-gray-100 w-full"
          >
            Add Slide
          </Button>
        </div>
      )}
      
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        effect={section.effect || 'slide'}
        autoplay={section.autoplay ? { delay: section.autoplayDelay || 5000 } : false}
        loop={section.loop !== false}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={handleSwiperChange}
        className="h-full w-full"
      >
        {(section.slides || []).map((slide, index) => (
          <SwiperSlide key={slide.id || index}>
            {renderSlide(slide, index)}
          </SwiperSlide>
        ))}
      </Swiper>

      {mediaDialogOpen && (
        <MediaLibrary
          isDialog
          type="all"
          onCloseAction={() => setMediaDialogOpen(false)}
          onSelectAction={(url) => {
            const type = url.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image';
            if (currentSlideIndex >= 0 && currentSlideIndex < (section.slides || []).length) {
              handleSlideContentChange(currentSlideIndex, 'url', url);
              handleSlideContentChange(currentSlideIndex, 'type', type);
            } else {
              handleAddSlide(url, type);
            }
            setMediaDialogOpen(false);
          }}
        />
      )}
    </div>
  );
} 