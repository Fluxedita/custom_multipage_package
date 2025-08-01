import React, { useState, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import Image from 'next/image';
import { Volume2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MediaLibrary from '@/components/media/MediaLibrary';
import { Section, SliderSectionType } from '@/types/sections';

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
  openInNewTab?: boolean;
  videoSettings?: {
    muted: boolean;
    autoplay: boolean;
    loop: boolean;
    controls: boolean;
  };
}

interface SliderSectionProps {
  section: SliderSectionType;
  isEditMode: boolean;
  onSectionChange: (section: Section) => void;
  speakText?: (text: string) => void;
  idx: number;
  renderSectionControls: (idx: number) => React.ReactNode;
}

export function SliderSection({ section, isEditMode, onSectionChange, speakText, idx, renderSectionControls }: SliderSectionProps) {
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const swiperRef = useRef<any>(null);

  // Initialize slides array if it doesn't exist
  useEffect(() => {
    if (!section.slides) {
      onSectionChange({
        ...section,
        slides: []
      });
    }
  }, [section.id]);

  // Set editing mode for the first slide when section is first created
  useEffect(() => {
    if (isEditMode && section.slides?.length === 0) {
      setEditingSlideIndex(0);
    }
  }, [section.id, isEditMode]);

  const handleSwiperChange = (swiper: any) => {
    setCurrentSlideIndex(swiper.activeIndex);
  };

  const handleAddSlide = (url: string, type: 'image' | 'video') => {
    console.log('Adding new slide:', { url, type });
    
    const newSlide: Slide = {
      id: Date.now().toString(),
      type,
      url,
      title: '',
      description: '',
      videoSettings: type === 'video' ? {
        muted: true,
        autoplay: true,
        loop: true,
        controls: true
      } : undefined
    };
    
    // Create new slides array with the new slide
    const updatedSlides = [...(section.slides || []), newSlide];
    
    // Update the section with new slides
    onSectionChange({
      ...section,
      slides: updatedSlides,
    });

    // Set the new slide as the current slide and start editing it
    setCurrentSlideIndex(updatedSlides.length - 1);
    setEditingSlideIndex(updatedSlides.length - 1);
    
    // Update Swiper to show the new slide
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.slideTo(updatedSlides.length - 1);
    }
  };

  const handleSlideContentChange = (index: number, field: keyof Slide, value: any) => {
    const updatedSlides = [...section.slides];
    updatedSlides[index] = {
      ...updatedSlides[index],
      [field]: value
    };
    onSectionChange({
      ...section,
      slides: updatedSlides
    });
  };

  const handleRemoveSlide = (index: number) => {
    const updatedSlides = section.slides.filter((_: Slide, i: number) => i !== index);
    onSectionChange({
      ...section,
      slides: updatedSlides,
    });
    setEditingSlideIndex(null);
    
    // Update current slide index if needed
    if (currentSlideIndex >= updatedSlides.length) {
      setCurrentSlideIndex(updatedSlides.length - 1);
      if (swiperRef.current?.swiper) {
        swiperRef.current.swiper.slideTo(updatedSlides.length - 1);
      }
    }
  };

  // Effect to update Swiper when slides data changes
  useEffect(() => {
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.update();
    }
  }, [section.slides]);

  const renderSlide = (slide: Slide, index: number) => {
    const isEditing = editingSlideIndex === index;

    if (isEditMode && isEditing) {
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
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id={`slide-cta-new-tab-${index}`}
                    checked={slide.openInNewTab !== false}
                    onChange={(e) => handleSlideContentChange(index, 'openInNewTab', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor={`slide-cta-new-tab-${index}`} className="text-sm text-gray-600">
                    Open link in new tab
                  </label>
                </div>

                {/* Video Settings */}
                {slide.type === 'video' && (
                  <div className="space-y-2 border-t pt-4">
                    <h4 className="font-medium text-gray-700">Video Settings</h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`video-muted-${index}`}
                        checked={slide.videoSettings?.muted ?? true}
                        onChange={(e) => {
                          const updatedSettings = {
                            ...(slide.videoSettings || {}),
                            muted: e.target.checked
                          };
                          handleSlideContentChange(index, 'videoSettings', updatedSettings);
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label htmlFor={`video-muted-${index}`} className="text-sm text-gray-600">
                        Muted by default
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`video-autoplay-${index}`}
                        checked={slide.videoSettings?.autoplay ?? true}
                        onChange={(e) => {
                          const updatedSettings = {
                            ...(slide.videoSettings || {}),
                            autoplay: e.target.checked
                          };
                          handleSlideContentChange(index, 'videoSettings', updatedSettings);
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label htmlFor={`video-autoplay-${index}`} className="text-sm text-gray-600">
                        Autoplay
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`video-loop-${index}`}
                        checked={slide.videoSettings?.loop ?? true}
                        onChange={(e) => {
                          const updatedSettings = {
                            ...(slide.videoSettings || {}),
                            loop: e.target.checked
                          };
                          handleSlideContentChange(index, 'videoSettings', updatedSettings);
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label htmlFor={`video-loop-${index}`} className="text-sm text-gray-600">
                        Loop
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`video-controls-${index}`}
                        checked={slide.videoSettings?.controls ?? true}
                        onChange={(e) => {
                          const updatedSettings = {
                            ...(slide.videoSettings || {}),
                            controls: e.target.checked
                          };
                          handleSlideContentChange(index, 'videoSettings', updatedSettings);
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label htmlFor={`video-controls-${index}`} className="text-sm text-gray-600">
                        Show video controls
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex justify-between space-x-2">
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
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setEditingSlideIndex(null);
                    }}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          </div>
          {slide.type === 'video' ? (
            <div className="relative w-full h-full">
              <video
                src={slide.url}
                className="w-full h-full object-cover"
                muted={slide.videoSettings?.muted ?? true}
                autoPlay={slide.videoSettings?.autoplay ?? true}
                loop={slide.videoSettings?.loop ?? true}
                controls={slide.videoSettings?.controls ?? true}
                playsInline
                onError={(e) => {
                  console.error('Video error:', e);
                  const videoElement = e.target as HTMLVideoElement;
                  videoElement.style.display = 'none';
                  const errorDiv = document.createElement('div');
                  errorDiv.className = 'absolute inset-0 flex items-center justify-center bg-gray-100';
                  errorDiv.innerHTML = '<p class="text-red-500">Failed to load video</p>';
                  videoElement.parentElement?.appendChild(errorDiv);
                }}
              />
            </div>
          ) : (
            <Image
              src={slide.url}
              alt={slide.title || ''}
              fill
              className="object-cover"
              onError={(e) => {
                console.error('Image error:', e);
                const imgElement = e.target as HTMLImageElement;
                imgElement.style.display = 'none';
                const errorDiv = document.createElement('div');
                errorDiv.className = 'absolute inset-0 flex items-center justify-center bg-gray-100';
                errorDiv.innerHTML = '<p class="text-red-500">Failed to load image</p>';
                imgElement.parentElement?.appendChild(errorDiv);
              }}
            />
          )}
        </div>
      );
    }

    return (
      <div className="relative h-full">
        {slide.type === 'video' ? (
          <div className="relative w-full h-full">
            <video
              src={slide.url}
              className="w-full h-full object-cover"
              autoPlay={slide.videoSettings?.autoplay ?? true}
              muted={slide.videoSettings?.muted ?? true}
              loop={slide.videoSettings?.loop ?? true}
              controls={slide.videoSettings?.controls ?? true}
              playsInline
              onError={(e) => {
                console.error('Video error:', e);
                const videoElement = e.target as HTMLVideoElement;
                videoElement.style.display = 'none';
                const errorDiv = document.createElement('div');
                errorDiv.className = 'absolute inset-0 flex items-center justify-center bg-gray-100';
                errorDiv.innerHTML = '<p class="text-red-500">Failed to load video</p>';
                videoElement.parentElement?.appendChild(errorDiv);
              }}
            />
          </div>
        ) : (
          <Image
            src={slide.url}
            alt={slide.title || ''}
            fill
            className="object-cover"
            onError={(e) => {
              console.error('Image error:', e);
              const imgElement = e.target as HTMLImageElement;
              imgElement.style.display = 'none';
              const errorDiv = document.createElement('div');
              errorDiv.className = 'absolute inset-0 flex items-center justify-center bg-gray-100';
              errorDiv.innerHTML = '<p class="text-red-500">Failed to load image</p>';
              imgElement.parentElement?.appendChild(errorDiv);
            }}
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
                  <a
                    href={slide.ctaUrl}
                    target={slide.openInNewTab !== false ? "_blank" : undefined}
                    rel={slide.openInNewTab !== false ? "noopener noreferrer" : undefined}
                  >
                    {slide.ctaText || 'Learn More'}
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
        {isEditMode && !isEditing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Button
              onClick={() => setEditingSlideIndex(index)}
              className="bg-white text-black hover:bg-gray-100"
            >
              Edit Slide
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      {isEditMode && (
        <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded text-xs">
          <strong>Section ID:</strong> {section.id}
          <span className="ml-2 text-gray-500">(Use this for nav links)</span>
        </div>
      )}
      {renderSectionControls(idx)}
      
      {/* Admin Interface */}
      {isEditMode && (
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-4">
          <div className="bg-white/90 p-4 rounded-lg shadow-lg space-y-4">
            <h3 className="text-lg font-semibold">Slider Settings</h3>
            
            {/* Timing Controls */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`slider-autoplay-${idx}`}
                  checked={section.autoplay}
                  onChange={(e) => onSectionChange({ ...section, autoplay: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor={`slider-autoplay-${idx}`} className="text-sm text-gray-600">
                  Enable autoplay
                </label>
              </div>
              
              {section.autoplay && (
                <div>
                  <label htmlFor={`autoplay-delay-${section.id}`} className="block text-sm font-medium text-gray-700">
                    Autoplay Delay (ms)
                  </label>
                  <input
                    type="number"
                    id={`autoplay-delay-${section.id}`}
                    value={section.autoplayDelay}
                    onChange={(e) => onSectionChange({ ...section, autoplayDelay: parseInt(e.target.value) })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    min="1000"
                    step="500"
                  />
                </div>
              )}
            </div>

            {/* Dimension Controls */}
            <div className="space-y-4">
              <div>
                <label htmlFor={`height-${section.id}`} className="block text-sm font-medium text-gray-700">
                  Height
                </label>
                <input
                  type="text"
                  id={`height-${section.id}`}
                  value={section.height}
                  onChange={(e) => onSectionChange({ ...section, height: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g. 500px, 70vh"
                />
              </div>
              
              <div>
                <label htmlFor={`width-${section.id}`} className="block text-sm font-medium text-gray-700">
                  Width
                </label>
                <select
                  id={`width-${section.id}`}
                  value={section.width}
                  onChange={(e) => onSectionChange({ ...section, width: e.target.value })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="100%">Container Width</option>
                  <option value="100vw">Full Viewport Width</option>
                  <option value="custom">Custom Width</option>
                </select>
                {section.width === 'custom' && (
                  <input
                    type="text"
                    value={section.customWidth || ''}
                    onChange={(e) => onSectionChange({ ...section, customWidth: e.target.value })}
                    className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g. 1200px, 80%"
                  />
                )}
              </div>
            </div>

            {/* Effect Controls */}
            <div className="space-y-4">
              <div>
                <label htmlFor={`effect-${section.id}`} className="block text-sm font-medium text-gray-700">
                  Transition Effect
                </label>
                <select
                  id={`effect-${section.id}`}
                  value={section.effect}
                  onChange={(e) => onSectionChange({ ...section, effect: e.target.value as 'slide' | 'fade' })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="slide">Slide</option>
                  <option value="fade">Fade</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`slider-loop-${idx}`}
                  checked={section.loop}
                  onChange={(e) => onSectionChange({ ...section, loop: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor={`slider-loop-${idx}`} className="text-sm text-gray-600">
                  Enable loop
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`slider-navigation-${idx}`}
                  checked={section.showNavigation}
                  onChange={(e) => onSectionChange({ ...section, showNavigation: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor={`slider-navigation-${idx}`} className="text-sm text-gray-600">
                  Show navigation arrows
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`slider-pagination-${idx}`}
                  checked={section.showPagination}
                  onChange={(e) => onSectionChange({ ...section, showPagination: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor={`slider-pagination-${idx}`} className="text-sm text-gray-600">
                  Show pagination dots
                </label>
              </div>
            </div>

            {/* Padding Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Horizontal Padding (rem)</label>
                <input
                  type="number"
                  min={0}
                  step={0.25}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={section.horizontalPadding ?? 0}
                  onChange={e => onSectionChange({ ...section, horizontalPadding: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Vertical Padding (rem)</label>
                <input
                  type="number"
                  min={0}
                  step={0.25}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={section.verticalPadding ?? 0}
                  onChange={e => onSectionChange({ ...section, verticalPadding: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => setMediaDialogOpen(true)}
              className="bg-white/90 hover:bg-white text-black"
            >
              Add Slide
            </Button>
            <Button
              onClick={() => {
                if (section.slides?.length > 0) {
                  setEditingSlideIndex(currentSlideIndex);
                }
              }}
              className="bg-white/90 hover:bg-white text-black"
              disabled={!section.slides?.length}
            >
              Edit Current Slide
            </Button>
          </div>
        </div>
      )}

      {/* Slider Container */}
      <div 
        className={`relative ${section.width === '100vw' ? 'w-screen -ml-[calc(50vw-50%)]' : 'w-full'}`} 
        style={{ 
          height: section.height || '500px',
          width: section.width === 'custom' ? section.customWidth : section.width,
          paddingLeft: `${section.horizontalPadding ?? 0}rem`,
          paddingRight: `${section.horizontalPadding ?? 0}rem`,
          paddingTop: `${section.verticalPadding ?? 0}rem`,
          paddingBottom: `${section.verticalPadding ?? 0}rem`,
        }}
      >
        {(section.slides?.length || 0) > 0 ? (
          <Swiper
            ref={swiperRef}
            modules={[Navigation, Pagination, Autoplay, EffectFade]}
            spaceBetween={0}
            slidesPerView={1}
            navigation={section.showNavigation}
            pagination={{ clickable: true }}
            autoplay={section.autoplay ? { delay: section.autoplayDelay } : false}
            effect={section.effect}
            loop={section.loop}
            onSlideChange={handleSwiperChange}
            className="w-full h-full"
          >
            {section.slides.map((slide, index) => (
              <SwiperSlide key={slide.id}>
                {renderSlide(slide, index)}
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <p className="text-gray-500 mb-4">No slides added yet</p>
              {isEditMode && (
                <Button
                  onClick={() => setMediaDialogOpen(true)}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add Your First Slide
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MediaLibrary Dialog */}
      {mediaDialogOpen && (
        <MediaLibrary
          isDialog
          type="all"
          onCloseAction={() => setMediaDialogOpen(false)}
          onSelectAction={(url, type) => {
            handleAddSlide(url, type as 'image' | 'video');
            setMediaDialogOpen(false);
          }}
        />
      )}
    </div>
  );
} 