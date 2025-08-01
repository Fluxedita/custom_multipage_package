import React, { useState } from 'react';
import { SectionWrapper } from '@/app/custom_pages/components/sections/SectionWrapper';
import { Button } from '@/components/ui/button';
import { v4 as uuid } from 'uuid';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { X, Play } from 'lucide-react';
import { toast } from 'sonner';

interface MediaCard {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
}

interface MediaPlaceholderSectionProps {
  section: {
    id: string;
    type: 'media-placeholder';
    cards: MediaCard[];
    visibleCount: number;
    currentPage: number;
    fullWidth?: boolean;
    maxWidth?: string; // e.g. '640px', '768px', '1024px', '1280px', 'none'
    padding?: string; // e.g. 'none', 'sm', 'md', 'lg'
    backgroundColor?: string; // e.g. '#ffffff', 'rgba(255,255,255,0.8)'
    backgroundOpacity?: number; // 0-100
    sectionBackgroundOpacity?: number; // 0-100 for section container
    cardBackgroundOpacity?: number; // 0-100 for individual cards
    horizontalPadding?: number; // rem
    verticalPadding?: number; // rem
  };
  isEditMode: boolean;
  onSectionChange: (updatedSection: any) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  onMediaSelect?: (cardId: string) => void;
  onDuplicate?: (duplicatedSection: any) => void;
}

// Enhanced Lightbox Component with Navigation
const SimpleLightbox: React.FC<{
  isOpen: boolean;
  mediaItems: MediaCard[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}> = ({ isOpen, mediaItems, currentIndex, onClose, onNavigate }) => {
  if (!isOpen || mediaItems.length === 0) return null;

  const currentMedia = mediaItems[currentIndex];
  const hasMultipleItems = mediaItems.length > 1;

  const handlePrevious = () => {
    const newIndex = currentIndex === 0 ? mediaItems.length - 1 : currentIndex - 1;
    onNavigate(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex === mediaItems.length - 1 ? 0 : currentIndex + 1;
    onNavigate(newIndex);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
        aria-label="Close lightbox"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Thumbnail Row at Top */}
      {mediaItems.length > 1 && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-full flex justify-center z-20">
          <div className="flex gap-2 overflow-x-auto max-w-2xl px-2 py-1 rounded bg-black/40">
            {mediaItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => onNavigate(idx)}
                className={`relative w-16 h-16 flex-shrink-0 rounded border-2 transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-white/80
                  ${idx === currentIndex ? 'border-white scale-110 shadow-lg z-10' : 'border-transparent opacity-70 hover:opacity-100'}`}
                aria-label={`Go to item ${idx + 1}`}
              >
                {item.mediaType === 'image' ? (
                  <img
                    src={item.mediaUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    {item.mediaUrl ? (
                      <video
                        src={item.mediaUrl}
                        className="w-full h-full object-cover opacity-60"
                        tabIndex={-1}
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800" />
                    )}
                    <Play className="absolute inset-0 m-auto text-white opacity-90 w-8 h-8 pointer-events-none" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section Count and Nav at Top Center */}
      {mediaItems.length > 1 && (
        <div className="absolute top-28 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-20 select-none">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            className="h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-200 hover:scale-110"
            aria-label="Previous media"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <span className="text-white text-lg font-semibold px-2">
            {currentIndex + 1} of {mediaItems.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-200 hover:scale-110"
            aria-label="Next media"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      )}

      <div className="relative h-full w-full max-w-4xl flex flex-col items-center justify-center">
        <div className="flex-1 flex items-center justify-center w-full">
          {currentMedia.mediaType === 'image' ? (
            <img
              src={currentMedia.mediaUrl}
              alt={currentMedia.title}
              className="max-h-[70vh] max-w-full object-contain"
            />
          ) : (
            <video
              src={currentMedia.mediaUrl}
              controls
              autoPlay
              className="max-h-[70vh] max-w-full"
            />
          )}
        </div>
      </div>

      {/* Media Info at Bottom */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg max-w-lg w-full">
        <div className="text-center">
          <div className="font-semibold truncate">{currentMedia.title}</div>
          {currentMedia.description && (
            <div className="text-sm opacity-90 mt-1 break-words whitespace-pre-line">{currentMedia.description}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export const MediaPlaceholderSection: React.FC<MediaPlaceholderSectionProps> = ({
  section,
  isEditMode,
  onSectionChange,
  onMoveUp,
  onMoveDown,
  onDelete,
  onMediaSelect,
  onDuplicate,
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentLightboxIndex, setCurrentLightboxIndex] = useState(0);
  const [currentCardId, setCurrentCardId] = useState<string | null>(null);

  // Defaults for new/old sections
  const fullWidth = section.fullWidth ?? false;
  const maxWidth = section.maxWidth ?? '1024px';
  const padding = section.padding ?? 'md';
  const backgroundColor = section.backgroundColor ?? '#ffffff';
  const backgroundOpacity = section.backgroundOpacity ?? 100;
  const sectionBackgroundOpacity = section.sectionBackgroundOpacity ?? 100;
  const cardBackgroundOpacity = section.cardBackgroundOpacity ?? 100;

  const totalPages = Math.ceil(section.cards.length / section.visibleCount);
  const startIndex = section.currentPage * section.visibleCount;
  const visibleCards = section.cards.slice(startIndex, startIndex + section.visibleCount);

  const handleAddCard = () => {
    if (section.cards.length >= 30) return;
    const newCard: MediaCard = {
      id: uuid(),
      title: 'New Media',
      description: 'Description here...',
      mediaUrl: '',
      mediaType: 'image',
    };
    onSectionChange({ ...section, cards: [...section.cards, newCard] });
  };

  const handleCardUpdate = (id: string, updated: Partial<MediaCard>) => {
    const updatedCards = section.cards.map(card =>
      card.id === id ? { ...card, ...updated } : card
    );
    onSectionChange({ ...section, cards: updatedCards });
  };

  const handleCardDelete = (id: string) => {
    onSectionChange({ ...section, cards: section.cards.filter(card => card.id !== id) });
  };

  const handleDuplicate = () => {
    if (!onDuplicate) return;
    
    // Create a deep copy of the section with new IDs
    const duplicatedSection = {
      ...section,
      id: `media-placeholder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      cards: section.cards.map((card, index) => ({
        ...card,
        id: `card-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        title: `${card.title} (Copy)`,
      })),
    };
    
    onDuplicate(duplicatedSection);
    toast.success('Media Placeholder section duplicated successfully!');
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(section.cards);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    onSectionChange({ ...section, cards: reordered });
  };

  // Padding classes
  const paddingClass =
    padding === 'none' ? 'p-0'
    : padding === 'sm' ? 'p-2 sm:p-4'
    : padding === 'lg' ? 'p-8 sm:p-12'
    : 'p-4 sm:p-6'; // md default

  // Max width style
  const maxWidthStyle = maxWidth === 'none' ? {} : { maxWidth };

  // Background style with opacity
  const getBackgroundStyle = () => {
    if (!backgroundColor || backgroundOpacity === 0) return {};
    
    // Convert hex to rgba if needed
    let bgColor = backgroundColor;
    if (backgroundColor.startsWith('#')) {
      const hex = backgroundColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      bgColor = `rgba(${r}, ${g}, ${b}, ${backgroundOpacity / 100})`;
    } else if (backgroundColor.startsWith('rgb(')) {
      // Convert rgb to rgba
      bgColor = backgroundColor.replace('rgb(', 'rgba(').replace(')', `, ${backgroundOpacity / 100})`);
    } else if (backgroundColor.startsWith('rgba(')) {
      // Update existing rgba opacity
      bgColor = backgroundColor.replace(/[\d.]+\)$/, `${backgroundOpacity / 100})`);
    }
    
    return { backgroundColor: bgColor };
  };

  // Section background style
  const getSectionBackgroundStyle = () => {
    if (sectionBackgroundOpacity === 100) return {};
    return { backgroundColor: `rgba(255, 255, 255, ${sectionBackgroundOpacity / 100})` };
  };

  // Card background style
  const getCardBackgroundStyle = () => {
    const baseStyle = {
      backgroundColor: cardBackgroundOpacity === 100 
        ? 'white' 
        : `rgba(255, 255, 255, ${cardBackgroundOpacity / 100})`
    };
    
    // Add border when opacity is low to make card boundaries visible
    if (cardBackgroundOpacity < 50) {
      return {
        ...baseStyle,
        border: '1px solid rgba(0, 0, 0, 0.1)'
      };
    }
    
    return baseStyle;
  };

  return (
    <div
      className={
        fullWidth
          ? `w-screen relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw]`
          : ''
      }
      style={fullWidth ? { width: '100vw', ...getBackgroundStyle(),
        paddingLeft: `${section.horizontalPadding ?? 0}rem`,
        paddingRight: `${section.horizontalPadding ?? 0}rem`,
        paddingTop: `${section.verticalPadding ?? 0}rem`,
        paddingBottom: `${section.verticalPadding ?? 0}rem`,
      } : {
        ...getBackgroundStyle(),
        paddingLeft: `${section.horizontalPadding ?? 0}rem`,
        paddingRight: `${section.horizontalPadding ?? 0}rem`,
        paddingTop: `${section.verticalPadding ?? 0}rem`,
        paddingBottom: `${section.verticalPadding ?? 0}rem`,
      }}
    >
      <div
        className={`mx-auto ${paddingClass}`}
        style={fullWidth ? maxWidthStyle : {}}
      >
        <SectionWrapper
          sectionId={section.id}
          isEditMode={isEditMode}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDelete={onDelete}
          onDuplicate={onDuplicate ? handleDuplicate : undefined}
          style={getSectionBackgroundStyle()}
          transparentBackground={sectionBackgroundOpacity < 100}
        >
          {isEditMode && (
            <div className="mb-4 flex flex-wrap gap-4 items-center bg-gray-50 border rounded p-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={fullWidth}
                  onChange={e => onSectionChange({ ...section, fullWidth: e.target.checked })}
                />
                Full viewport width
              </label>
              <label className="flex items-center gap-2">
                Max width:
                <select
                  value={maxWidth}
                  onChange={e => onSectionChange({ ...section, maxWidth: e.target.value })}
                  disabled={!fullWidth}
                  className="border rounded px-2 py-1"
                >
                  <option value="640px">640px (sm)</option>
                  <option value="768px">768px (md)</option>
                  <option value="1024px">1024px (lg)</option>
                  <option value="1280px">1280px (xl)</option>
                  <option value="none">None (100%)</option>
                </select>
              </label>
              <label className="flex items-center gap-2">
                Horizontal Padding (rem):
                <input
                  type="number"
                  min={0}
                  step={0.25}
                  value={section.horizontalPadding ?? 0}
                  onChange={e => onSectionChange({ ...section, horizontalPadding: Number(e.target.value) })}
                  className="w-20 border rounded px-2 py-1"
                />
              </label>
              <label className="flex items-center gap-2">
                Vertical Padding (rem):
                <input
                  type="number"
                  min={0}
                  step={0.25}
                  value={section.verticalPadding ?? 0}
                  onChange={e => onSectionChange({ ...section, verticalPadding: Number(e.target.value) })}
                  className="w-20 border rounded px-2 py-1"
                />
              </label>
              <label className="flex items-center gap-2">
                Background:
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={e => onSectionChange({ ...section, backgroundColor: e.target.value })}
                  className="w-10 h-8 border rounded cursor-pointer"
                />
              </label>
              <label className="flex items-center gap-2">
                Background Opacity:
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={backgroundOpacity}
                  onChange={e => onSectionChange({ ...section, backgroundOpacity: parseInt(e.target.value) })}
                  className="w-20"
                />
                <span className="text-sm w-8">{backgroundOpacity}%</span>
              </label>
              <label className="flex items-center gap-2">
                Section Opacity:
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sectionBackgroundOpacity}
                  onChange={e => onSectionChange({ ...section, sectionBackgroundOpacity: parseInt(e.target.value) })}
                  className="w-20"
                />
                <span className="text-sm w-8">{sectionBackgroundOpacity}%</span>
              </label>
              <label className="flex items-center gap-2">
                Card Opacity:
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cardBackgroundOpacity}
                  onChange={e => onSectionChange({ ...section, cardBackgroundOpacity: parseInt(e.target.value) })}
                  className="w-20"
                />
                <span className="text-sm w-8">{cardBackgroundOpacity}%</span>
              </label>
            </div>
          )}
          <div className="flex justify-between items-center mb-4">
            {isEditMode && (
              <>
                <Button onClick={handleAddCard} disabled={section.cards.length >= 30}>
                  Add Media Card
                </Button>
                <select
                  value={section.visibleCount}
                  onChange={e =>
                    onSectionChange({ ...section, visibleCount: parseInt(e.target.value), currentPage: 0 })
                  }
                  className="ml-4 border rounded px-2 py-1"
                >
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>
                      Show {n} per page
                    </option>
                  ))}
                </select>
              </>
            )}
            {section.cards.length > section.visibleCount && (
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    onSectionChange({ ...section, currentPage: Math.max(0, section.currentPage - 1) })
                  }
                  disabled={section.currentPage === 0}
                >
                  ←
                </Button>
                <Button
                  onClick={() =>
                    onSectionChange({
                      ...section,
                      currentPage: Math.min(totalPages - 1, section.currentPage + 1),
                    })
                  }
                  disabled={section.currentPage >= totalPages - 1}
                >
                  →
                </Button>
              </div>
            )}
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="media-cards" direction="horizontal">
              {(provided) => (
                <div
                  className={`grid gap-6 grid-cols-1 sm:grid-cols-${Math.min(section.visibleCount, 2)} lg:grid-cols-${section.visibleCount}`}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {visibleCards.map((card, index) => (
                    <Draggable key={card.id} draggableId={card.id} index={startIndex + index}>
                      {(provided) => (
                        <div
                          className="rounded-lg shadow overflow-hidden"
                          style={getCardBackgroundStyle()}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div
                            className="relative h-48 cursor-pointer"
                            onClick={() => {
                              if (isEditMode) {
                                if (onMediaSelect) {
                                  onMediaSelect(card.id);
                                  // Store the card ID in state to handle media selection
                                  setCurrentCardId(card.id);
                                }
                              } else {
                                // Find the index of the clicked card in all cards (not just visible ones)
                                const allCardsIndex = section.cards.findIndex(c => c.id === card.id);
                                setCurrentLightboxIndex(allCardsIndex);
                                setLightboxOpen(true);
                              }
                            }}
                          >
                            {card.mediaUrl ? (
                              card.mediaType === 'video' ? (
                                <video src={card.mediaUrl} className="w-full h-full object-cover" controls />
                              ) : (
                                <img src={card.mediaUrl} className="w-full h-full object-cover" alt={card.title} />
                              )
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                                <div className="text-center text-gray-500">
                                  <div className="text-2xl mb-2">📷</div>
                                  <div className="text-sm">
                                    {isEditMode ? 'Click to add media' : 'No media'}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            {isEditMode ? (
                              <>
                                <input
                                  type="text"
                                  value={card.title}
                                  onChange={e => handleCardUpdate(card.id, { title: e.target.value })}
                                  className="w-full mb-2 border rounded px-2 py-1"
                                  placeholder="Title"
                                />
                                <textarea
                                  value={card.description}
                                  onChange={e => handleCardUpdate(card.id, { description: e.target.value })}
                                  className="w-full border rounded px-2 py-1"
                                  placeholder="Description"
                                />
                                <input
                                  type="text"
                                  value={card.mediaUrl}
                                  onChange={e => handleCardUpdate(card.id, { mediaUrl: e.target.value })}
                                  className="w-full mt-2 border rounded px-2 py-1"
                                  placeholder="Media URL"
                                />
                                <select
                                  value={card.mediaType}
                                  onChange={e => handleCardUpdate(card.id, { mediaType: e.target.value as 'image' | 'video' })}
                                  className="w-full mt-2 border rounded px-2 py-1"
                                >
                                  <option value="image">Image</option>
                                  <option value="video">Video</option>
                                </select>
                                <Button variant="destructive" className="mt-2" onClick={() => handleCardDelete(card.id)}>
                                  Delete Card
                                </Button>
                              </>
                            ) : (
                              <>
                                <h3 className="text-lg font-semibold">{card.title}</h3>
                                <p className="text-sm text-gray-600">{card.description}</p>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <SimpleLightbox
            isOpen={lightboxOpen}
            mediaItems={section.cards}
            currentIndex={currentLightboxIndex}
            onClose={() => setLightboxOpen(false)}
            onNavigate={setCurrentLightboxIndex}
          />
        </SectionWrapper>
      </div>
    </div>
  );
};
