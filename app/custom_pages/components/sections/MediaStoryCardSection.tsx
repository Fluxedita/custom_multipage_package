import React from "react";
import Image from "next/image";
import clsx from "clsx";
import { Plus, X, Edit2, Check, X as XIcon, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { MediaStoryCardSectionType } from "@/app/custom_pages/types/sections";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Alignment = 'left' | 'center' | 'right';

const alignmentIcons = {
  left: <AlignLeft className="h-4 w-4" />,
  center: <AlignCenter className="h-4 w-4" />,
  right: <AlignRight className="h-4 w-4" />,
};

export type LinkTarget = '_self' | '_blank';

export type MediaStoryCard = {
  id: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  title: string; // limit to ~60 chars for 2 lines
  tagline: string;
  taglineLink?: string; // Optional link for the tagline
  linkTarget?: LinkTarget; // How the link should open
  thumbnailUrl: string;
  linkUrl?: string;
};

type MediaStoryCardSectionProps = {
  section: MediaStoryCardSectionType;
  isEditMode?: boolean;
  onSectionChange?: (section: MediaStoryCardSectionType) => void;
  onMediaSelect?: (cardId: string) => void;
  onThumbnailSelect?: (cardId: string) => void;
};

export const MediaStoryCardSection: React.FC<MediaStoryCardSectionProps> = ({
  section,
  isEditMode = false,
  onSectionChange,
  onMediaSelect,
  onThumbnailSelect,
}) => {
  const { 
    title: initialTitle = 'Featured Stories', 
    titleAlignment: initialAlignment = 'left',
    cards = [], 
    columns = 4 
  } = section;
  const columnCount = Math.min(Math.max(columns, 1), 6);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [editedTitle, setEditedTitle] = React.useState(initialTitle);
  const [alignment, setAlignment] = React.useState<Alignment>(initialAlignment);
  
  // Update local state when section title changes from parent
  React.useEffect(() => {
    setEditedTitle(initialTitle);
    setAlignment(initialAlignment);
  }, [initialTitle, initialAlignment]);
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTitle(e.target.value);
  };
  
  const saveTitle = () => {
    if (onSectionChange) {
      onSectionChange({
        ...section,
        title: editedTitle,
        titleAlignment: alignment
      });
    }
    setIsEditingTitle(false);
  };
  
  const cancelEdit = () => {
    setEditedTitle(initialTitle);
    setIsEditingTitle(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveTitle();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const handleAlignmentChange = (newAlignment: Alignment) => {
    setAlignment(newAlignment);
    if (onSectionChange) {
      onSectionChange({
        ...section,
        titleAlignment: newAlignment
      });
    }
  };

  const [lightboxCardId, setLightboxCardId] = React.useState<string | null>(null);
  const openLightbox = (cardId: string) => setLightboxCardId(cardId);
  const closeLightbox = () => setLightboxCardId(null);

  const handleCardChange = (cardId: string, updates: Partial<MediaStoryCard>) => {
    if (!onSectionChange) return;
    const updatedCards = cards.map(card =>
      card.id === cardId ? { ...card, ...updates } : card
    );
    onSectionChange({
      ...section,
      cards: updatedCards
    });
  };

  const handleDeleteCard = (cardId: string) => {
    if (!onSectionChange) return;
    const updatedCards = cards.filter(card => card.id !== cardId);
    onSectionChange({
      ...section,
      cards: updatedCards
    });
  };

  return (
    <section className="py-8 px-4 md:px-8">
      <div className="mb-6">
        <div 
          className={`flex ${alignment === 'left' ? 'justify-start' : alignment === 'center' ? 'justify-center' : 'justify-end'}`}
        >
          <div className="flex items-center gap-2 max-w-full">
            {isEditingTitle ? (
              <div className="flex-1 flex items-center gap-2">
                <Input
                  value={editedTitle}
                  onChange={handleTitleChange}
                  onKeyDown={handleKeyDown}
                  className="text-2xl font-semibold text-gray-900 p-2 border-gray-300"
                  autoFocus
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={saveTitle}
                  className="h-8 w-8"
                  aria-label="Save title"
                >
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={cancelEdit}
                  className="h-8 w-8"
                  aria-label="Cancel editing"
                >
                  <XIcon className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {initialTitle}
                </h2>
                {isEditMode && (
                  <div className="flex items-center gap-1 ml-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setIsEditingTitle(true)}
                      className="h-8 w-8 text-gray-500 hover:text-gray-700"
                      aria-label="Edit title"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-gray-500 hover:text-gray-700"
                          aria-label="Change alignment"
                        >
                          {alignmentIcons[alignment]}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAlignmentChange('left')}>
                          <AlignLeft className="mr-2 h-4 w-4" />
                          <span>Left</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAlignmentChange('center')}>
                          <AlignCenter className="mr-2 h-4 w-4" />
                          <span>Center</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAlignmentChange('right')}>
                          <AlignRight className="mr-2 h-4 w-4" />
                          <span>Right</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={clsx("grid gap-6", `grid-cols-1 sm:grid-cols-2 md:grid-cols-${columnCount}`)}>
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200 relative"
          >
            {isEditMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCard(card.id);
                }}
                className="absolute -top-2 -right-2 z-20 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                aria-label="Delete card"
                title="Delete card"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="relative aspect-video w-full overflow-hidden group">
              {/* Lightbox trigger overlay in view mode */}
              {!isEditMode && card.mediaUrl && (
                <button
                  type="button"
                  className="absolute inset-0 w-full h-full z-10 cursor-zoom-in"
                  onClick={() => openLightbox(card.id)}
                  style={{ background: "transparent", border: "none", padding: 0, margin: 0 }}
                  aria-label="Open media"
                />
              )}
              {card.mediaType === "image" ? (
                <Image
                  src={card.mediaUrl || "/placeholder-image.jpg"}
                  alt={card.title || 'Story visual'}
                  fill
                  className="object-cover rounded-t-xl"
                />
              ) : (
                <video
                  src={card.mediaUrl}
                  controls
                  className="w-full h-full object-cover rounded-t-xl"
                />
              )}
              {isEditMode && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onMediaSelect?.(card.id)}
                    className="px-4 py-2 bg-white text-gray-800 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Change Media
                  </button>
                </div>
              )}
            </div>
            <div className="p-4">
              {isEditMode ? (
                <input
                  type="text"
                  value={card.title}
                  onChange={(e) => handleCardChange(card.id, { title: e.target.value })}
                  className="w-full text-base font-medium text-gray-900 mb-2 p-1 border rounded"
                  placeholder="Card title"
                />
              ) : (
                <p className="text-base font-medium text-gray-900 leading-tight line-clamp-2">
                  {card.title}
                </p>
              )}
              <div className="flex items-center gap-2 mt-3">
                {/* Editable thumbnail avatar */}
                <span
                  className={clsx(
                    "inline-block w-8 h-8 rounded-full border border-gray-300 bg-gray-100 overflow-hidden flex-shrink-0",
                    isEditMode ? "cursor-pointer hover:ring-2 ring-blue-400" : ""
                  )}
                  onClick={() => isEditMode && onThumbnailSelect?.(card.id)}
                  title={isEditMode ? "Change thumbnail" : ""}
                  role="button"
                  tabIndex={isEditMode ? 0 : -1}
                  style={{ minWidth: 32, minHeight: 32 }}
                >
                  {card.thumbnailUrl ? (
                    <Image
                      src={card.thumbnailUrl}
                      alt="Thumbnail"
                      width={32}
                      height={32}
                      className="object-cover w-8 h-8"
                    />
                  ) : (
                    <span className="flex items-center justify-center w-full h-full text-gray-400 text-xs select-none">{isEditMode ? "+" : null}</span>
                  )}
                </span>
                {isEditMode ? (
                  <div className="flex-1 flex flex-col gap-1">
                    <input
                      type="text"
                      value={card.tagline}
                      onChange={(e) => handleCardChange(card.id, { tagline: e.target.value })}
                      className="w-full text-sm text-gray-600 p-1 border rounded"
                      placeholder="Card tagline"
                    />
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={card.linkUrl || ''}
                        onChange={(e) => handleCardChange(card.id, { linkUrl: e.target.value })}
                        className="flex-1 text-xs text-gray-600 p-1 border rounded"
                        placeholder="Tagline link (optional)"
                      />
                      <select
                        value={card.linkTarget || '_self'}
                        onChange={(e) => handleCardChange(card.id, { linkTarget: e.target.value as LinkTarget })}
                        className="text-xs border rounded"
                        title="Link target"
                      >
                        <option value="_self">Same tab</option>
                        <option value="_blank">New tab</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600 truncate max-w-[80%]">
                    {card.linkUrl ? (
                      <a 
                        href={card.linkUrl} 
                        target={card.linkTarget || '_self'}
                        rel={card.linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
                        className="text-gray-900 hover:text-gray-900 hover:underline truncate inline-block max-w-full"
                        title={card.linkUrl}
                      >
                        {card.tagline}
                      </a>
                    ) : (
                      <span className="truncate inline-block max-w-full">{card.tagline}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isEditMode && (
          <button
            onClick={() => {
              const newCard: MediaStoryCard = {
                id: `card-${Date.now()}`,
                title: 'New Story',
                tagline: 'Add a description',
                linkTarget: '_self',
                mediaUrl: '',
                mediaType: 'image',
                thumbnailUrl: '',
              };
              onSectionChange?.({
                ...section,
                cards: [...cards, newCard]
              });
            }}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            <Plus className="w-6 h-6 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Add Card</span>
          </button>
        )}
      </div>
      {/* Lightbox modal */}
      {lightboxCardId && (() => {
        const card = cards.find(c => c.id === lightboxCardId);
        if (!card) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" onClick={closeLightbox}>
            <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
              {card.mediaType === "image" ? (
                <Image src={card.mediaUrl} alt={card.title} width={800} height={450} className="w-full h-auto rounded" />
              ) : (
                <video src={card.mediaUrl} controls className="w-full h-auto rounded" />
              )}
              <button
                className="absolute top-2 right-2 text-white text-2xl"
                onClick={closeLightbox}
                aria-label="Close"
              >×</button>
            </div>
          </div>
        );
      })()}
    </section>
  );
};
