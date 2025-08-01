import React, { useState, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import MediaLibrary from '@/components/media/MediaLibrary';
import { Section, AdvancedSliderSection as AdvancedSliderSectionType } from '@/app/custom_pages/types/sections';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TextStyleEditor, TextStyle } from './TextStyleEditor';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface AdvancedSliderSectionProps {
  section: AdvancedSliderSectionType;
  isEditMode: boolean;
  onSectionChange: (section: Section) => void;
  idx: number;
  renderSectionControls: (idx: number) => React.ReactNode;
}

export const AdvancedSliderSection = function({ section, isEditMode, onSectionChange, idx, renderSectionControls }: AdvancedSliderSectionProps) {
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const swiperRef = useRef<any>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!section.slides) {
      onSectionChange({
        ...section,
        slides: []
      });
    }
  }, [section.id]);

  const handleSwiperChange = (swiper: any) => {
    setCurrentSlideIndex(swiper.activeIndex);
  };

  const handleAddSlide = (url: string, type: 'image' | 'video') => {
    const newSlide = {
      id: Date.now().toString(),
      type,
      url,
      title: '',
      description: '',
      fontStyle: 'normal' as 'normal',
      fontColor: '#000000' as string,
      fontSize: '24px' as string,
      videoSettings: type === 'video' ? {
        muted: true,
        autoplay: true,
        loop: true,
        controls: true
      } : undefined
    };
    const updatedSlides = [...(section.slides || []), newSlide];
    onSectionChange({ ...section, slides: updatedSlides });
    setCurrentSlideIndex(updatedSlides.length - 1);
    setEditingSlideIndex(updatedSlides.length - 1);
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.slideTo(updatedSlides.length - 1);
    }
  };

  const handleSlideContentChange = (index: number, field: string, value: any) => {
    const updatedSlides = [...section.slides];
    updatedSlides[index] = {
      ...updatedSlides[index],
      [field]: value
    };
    onSectionChange({ ...section, slides: updatedSlides });
  };

  const handleSlideTextStyleChange = (index: number, style: TextStyle) => {
    const updatedSlides = [...section.slides];
    updatedSlides[index] = {
      ...updatedSlides[index],
      ...style,
    };
    onSectionChange({ ...section, slides: updatedSlides });
  };

  const handleRemoveSlide = (index: number) => {
    const updatedSlides = section.slides.filter((_, i) => i !== index);
    onSectionChange({ ...section, slides: updatedSlides });
    setEditingSlideIndex(null);
    if (currentSlideIndex >= updatedSlides.length) {
      setCurrentSlideIndex(updatedSlides.length - 1);
      if (swiperRef.current?.swiper) {
        swiperRef.current.swiper.slideTo(updatedSlides.length - 1);
      }
    }
  };

  useEffect(() => {
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.update();
    }
  }, [section.slides]);

  const renderSlide = (slide: any, index: number) => {
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
                {/* Shared Text Style Editor */}
                <TextStyleEditor
                  value={slide}
                  onChange={style => handleSlideTextStyleChange(index, style)}
                />
                <div className="flex justify-between space-x-2">
                  <Button variant="destructive" size="sm" onClick={() => handleRemoveSlide(index)}>
                    Remove Slide
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setCurrentSlideIndex(index); setMediaDialogOpen(true); }}>
                    Change Media
                  </Button>
                  <Button variant="default" size="sm" onClick={() => setEditingSlideIndex(null)}>
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
              />
            </div>
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
    // View mode
    const fontStyle = slide.fontStyle || 'normal';
    const fontWeight = fontStyle === 'bold' ? 'bold' : 'normal';
    const fontStyleCss = fontStyle === 'italic' ? 'italic' : 'normal';
    const fontColor = slide.fontColor || '#000000';
    const fontSize = slide.fontSize || '24px';
    const textShadow = slide.textShadow
      ? `${slide.textShadow.offsetX || '2px'} ${slide.textShadow.offsetY || '2px'} ${slide.textShadow.blur || '4px'} ${slide.textShadow.color || '#000000'}`
      : undefined;
    const textOutline = slide.textOutline
      ? `${slide.textOutline.width || '2px'} ${slide.textOutline.color || '#ffffff'}`
      : undefined;
    const textBg = slide.textBackground;
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
            />
          </div>
        ) : (
          <Image
            src={slide.url}
            alt={slide.title || ''}
            fill
            className="object-cover"
          />
        )}
        {(slide.title || slide.description) && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="text-center max-w-2xl px-4">
              {(slide.title || slide.description) && (
                <div
                  style={textBg ? {
                    display: 'inline-block',
                    background: textBg.color || '#000000',
                    opacity: textBg.opacity ?? 0.5,
                    borderRadius: textBg.borderRadius || '8px',
                    padding: textBg.padding || '8px 16px',
                    backdropFilter: textBg.blur ? `blur(${textBg.blur})` : undefined,
                    WebkitBackdropFilter: textBg.blur ? `blur(${textBg.blur})` : undefined,
                  } : {}}
                  className="inline-block"
                >
                  {slide.title && (
                    <h2
                      style={{
                        color: fontColor,
                        fontSize,
                        fontStyle: fontStyleCss,
                        fontWeight,
                        textShadow,
                        WebkitTextStroke: textOutline,
                        marginBottom: slide.description ? '0.5em' : 0,
                      }}
                      className="mb-2"
                    >
                      {slide.title}
                    </h2>
                  )}
                  {slide.description && (
                    <p
                      style={{
                        color: fontColor,
                        fontSize,
                        fontStyle: fontStyleCss,
                        fontWeight,
                        textShadow,
                        WebkitTextStroke: textOutline,
                        margin: 0,
                      }}
                      className="mb-4"
                    >
                      {slide.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {isEditMode && !isEditing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Button onClick={() => setEditingSlideIndex(index)} className="bg-white text-black hover:bg-gray-100">
              Edit Slide
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={
      section.width === '100vw'
        ? 'relative w-screen left-1/2 right-1/2 ml-[-50vw] mr-[-50vw]'
        : 'relative w-full'
    }>
      {isEditMode && (
        <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded text-xs">
          <strong>Section ID:</strong> {section.id}
          <span className="ml-2 text-gray-500">(Use this for nav links)</span>
        </div>
      )}
      {renderSectionControls(idx)}
      {isEditMode && (
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-4 min-w-[260px]">
          <Button
            variant="outline"
            className="flex items-center justify-between w-full"
            onClick={() => setSettingsOpen((open) => !open)}
            aria-expanded={settingsOpen}
            aria-controls={`advanced-slider-settings-panel-${section.id}`}
          >
            Advanced Slider Settings
            {settingsOpen ? <ChevronUp className="ml-2 w-4 h-4" /> : <ChevronDown className="ml-2 w-4 h-4" />}
          </Button>
          {settingsOpen && (
            <div id={`advanced-slider-settings-panel-${section.id}`} className="bg-white/90 p-4 rounded-lg shadow-lg space-y-4 mt-2">
              <div className="flex items-center justify-between">
                <label className="font-medium text-sm">Autoplay</label>
                <input
                  type="checkbox"
                  checked={section.autoplay ?? false}
                  onChange={e => onSectionChange({ ...section, autoplay: e.target.checked })}
                  className="ml-2"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="font-medium text-sm">Autoplay Delay (ms)</label>
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={section.autoplayDelay ?? 5000}
                  onChange={e => onSectionChange({ ...section, autoplayDelay: Number(e.target.value) })}
                  className="ml-2 w-24 border rounded px-2 py-1"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="font-medium text-sm">Transition</label>
                <select
                  value={section.effect ?? 'fade'}
                  onChange={e => onSectionChange({ ...section, effect: e.target.value as 'slide' | 'fade' })}
                  className="ml-2 border rounded px-2 py-1"
                >
                  <option value="slide">Slide</option>
                  <option value="fade">Fade</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label className="font-medium text-sm">Show Navigation</label>
                <input
                  type="checkbox"
                  checked={section.showNavigation ?? true}
                  onChange={e => onSectionChange({ ...section, showNavigation: e.target.checked })}
                  className="ml-2"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="font-medium text-sm">Show Pagination</label>
                <input
                  type="checkbox"
                  checked={section.showPagination ?? true}
                  onChange={e => onSectionChange({ ...section, showPagination: e.target.checked })}
                  className="ml-2"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="font-medium text-sm">Loop</label>
                <input
                  type="checkbox"
                  checked={section.loop ?? true}
                  onChange={e => onSectionChange({ ...section, loop: e.target.checked })}
                  className="ml-2"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="font-medium text-sm">Height</label>
                <input
                  type="text"
                  value={section.height ?? '500px'}
                  onChange={e => onSectionChange({ ...section, height: e.target.value })}
                  className="ml-2 w-24 border rounded px-2 py-1"
                  placeholder="e.g. 500px"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="font-medium text-sm">Width</label>
                <div className="flex items-center gap-2 ml-2">
                  <select
                    value={['100%', '100vw'].includes(section.width ?? '100%') ? section.width ?? '100%' : 'custom'}
                    onChange={e => {
                      const value = e.target.value;
                      if (value === 'custom') {
                        onSectionChange({ ...section, width: section.customWidth || '' });
                      } else {
                        onSectionChange({ ...section, width: value, customWidth: '' });
                      }
                    }}
                    className="border rounded px-2 py-1"
                  >
                    <option value="100%">Container Width</option>
                    <option value="100vw">Full Viewport Width</option>
                    <option value="custom">Custom</option>
                  </select>
                  {(['100%', '100vw'].includes(section.width ?? '100%') || !section.width) ? null : (
                    <input
                      type="text"
                      value={section.width}
                      onChange={e => onSectionChange({ ...section, width: e.target.value })}
                      className="w-24 border rounded px-2 py-1"
                      placeholder="e.g. 1200px, 80%"
                    />
                  )}
                </div>
              </div>
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
          )}
          <div className="flex gap-2">
            <Button onClick={() => setMediaDialogOpen(true)} className="bg-white/90 hover:bg-white text-black">
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
      <div
        className={`relative ${section.width === '100vw' ? 'w-screen -ml-[calc(50vw-50%)]' : 'w-full'}`}
        style={{
          height: section.height || '500px',
          width: section.width === 'custom' ? section.customWidth : section.width === '100vw' ? '100vw' : section.width,
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
                <Button onClick={() => setMediaDialogOpen(true)} className="bg-blue-600 text-white hover:bg-blue-700">
                  Add Your First Slide
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
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