export type LinkTarget = '_self' | '_blank';

export type SectionType = 
  | 'hero'
  | 'hero-responsive'
  | 'text'
  | 'content'
  | 'media-text-left'
  | 'media-text-right'
  | 'divider'
  | 'heading'
  | 'quote'
  | 'cta'
  | 'gallery'
  | 'mediaTextColumns'
  | 'twoColumnText'
  | 'feature'
  | 'slider'
  | 'feature-card-grid'
  | 'advanced-slider'
  | 'info-card'
  | 'privacy'
  | 'custom-code'
  | 'media-placeholder'
  | 'editable-title'
  | 'text-with-video-left'
  | 'text-with-video-right'
  | 'product-package-left'
  | 'product-package-right'
  | 'media-story-cards'
  | 'footer';

export type HorizontalAlignment = 'left' | 'center' | 'right';

export interface BaseSection {
  id: string;
  type: SectionType;
  visible: boolean;
  enableSpeech: boolean;
  horizontalAlign?: HorizontalAlignment;
}

export interface HeroSection extends BaseSection {
  type: 'hero';
  title: string;
  description: string;
  backgroundImage?: string;
  backgroundMedia?: string;
  mediaType?: 'image' | 'video';
  height?: string;
  width?: string;
  enableTitleSpeech: boolean;
  enableDescriptionSpeech: boolean;
  objectFit?: 'cover' | 'contain' | 'auto';
  objectPosition?: 'top' | 'center' | 'bottom';
  maxHeight?: number;
  fontStyle?: 'normal' | 'italic' | 'bold';
  fontColor?: string;
  fontSize?: string;
  textShadow?: {
    color: string;
    offsetX: string;
    offsetY: string;
    blur: string;
  };
  textOutline?: {
    color: string;
    width: string;
  };
  textBackground?: {
    color: string;
    opacity: number;
    blur: string;
    borderRadius: string;
    padding: string;
  };
  paddingBottom?: number;
  horizontalPadding?: number;
  verticalPadding?: number;
}

export interface HeroSectionResponsiveType extends BaseSection {
  type: 'hero-responsive';
  title: string;
  description: string;
  buttonText?: string;
  buttonUrl?: string;
  backgroundImage?: string;
  backgroundMedia?: string;
  mediaType?: 'image' | 'video';
  overlayColor?: string;
  textColor?: string;
  enableTitleSpeech?: boolean;
  enableDescriptionSpeech?: boolean;
  height?: string;
  width?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  textVerticalAlign?: 'top' | 'middle' | 'bottom';
  textHorizontalAlign?: 'left' | 'center' | 'right';
  titleTextStyle?: import('@/app/custom_pages/components/sections/TextStyleEditor').TextStyle;
  descriptionTextStyle?: import('@/app/custom_pages/components/sections/TextStyleEditor').TextStyle;
  horizontalPadding?: number;
  verticalPadding?: number;
}

export interface TextSection extends BaseSection {
  type: 'text';
  content: string;
  alignment: 'left' | 'center' | 'right';
  fontSize: string;
  fontColor: string;
  backgroundColor: string;
  padding: string;
  margin: string;
  textStyle?: import('@/app/custom_pages/components/sections/TextStyleEditor').TextStyle;
  // Optional media support
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  mediaPosition?: 'top' | 'bottom' | 'left' | 'right';
  mediaWidth?: string;
  mediaHeight?: string;
  // Transparency controls
  fullWidth?: boolean;
  maxWidth?: string;
  backgroundOpacity?: number;
  sectionBackgroundOpacity?: number;
  textBackgroundOpacity?: number;
  sectionBackgroundColor?: string;
  horizontalPadding?: number;
  verticalPadding?: number;
}

export interface ContentSection extends BaseSection {
  type: 'content';
  content: string;
  alignment: 'left' | 'center' | 'right';
  fontSize: string;
  fontColor: string;
  backgroundColor: string;
  padding: string;
  margin: string;
  textStyle?: import('@/app/custom_pages/components/sections/TextStyleEditor').TextStyle;
}

export interface MediaTextSection extends BaseSection {
  type: 'media-text-left' | 'media-text-right';
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  enableTitleSpeech: boolean;
  enableDescriptionSpeech: boolean;
  mediaPosition?: 'left' | 'right';
  titleTextStyle?: import('@/app/custom_pages/components/sections/TextStyleEditor').TextStyle;
  descriptionTextStyle?: import('@/app/custom_pages/components/sections/TextStyleEditor').TextStyle;
}

export interface DividerSection extends BaseSection {
  type: 'divider';
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
  thickness: string;
  width: string;
  margin: string;
  alignment: 'left' | 'center' | 'right';
  horizontalPadding?: number;
  verticalPadding?: number;
}

export interface HeadingSection extends BaseSection {
  type: 'heading';
  text: string;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  alignment: 'left' | 'center' | 'right';
  fontSize: string;
  fontColor: string;
  enableSpeech: boolean;
  textStyle?: import('@/app/custom_pages/components/sections/TextStyleEditor').TextStyle;
}

export interface QuoteSection extends BaseSection {
  type: 'quote';
  text: string;
  author: string;
  alignment: 'left' | 'center' | 'right';
  fontSize: string;
  fontColor: string;
  enableSpeech: boolean;
  textStyle?: import('@/app/custom_pages/components/sections/TextStyleEditor').TextStyle;
  authorTextStyle?: import('@/app/custom_pages/components/sections/TextStyleEditor').TextStyle;
}

export interface CTASection extends BaseSection {
  type: 'cta';
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  backgroundColor: string;
  textColor: string;
  enableTitleSpeech: boolean;
  enableDescriptionSpeech: boolean;
  titleTextStyle?: import('@/app/custom_pages/components/sections/TextStyleEditor').TextStyle;
  descriptionTextStyle?: import('@/app/custom_pages/components/sections/TextStyleEditor').TextStyle;
  paddingTop?: number;
  paddingBottom?: number;
  horizontalPadding?: number;
  verticalPadding?: number;
}

export interface GallerySection extends BaseSection {
  type: 'gallery';
  title: string;
  description: string;
  images: { url: string; alt: string }[];
  url?: string;
  alt?: string;
  backgroundImage?: string;
  layout: 'grid' | 'masonry' | 'carousel';
  enableTitleSpeech: boolean;
  enableDescriptionSpeech: boolean;
  enableImageSpeech: boolean;
  titleTextStyle?: import('@/app/custom_pages/components/sections/TextStyleEditor').TextStyle;
  descriptionTextStyle?: import('@/app/custom_pages/components/sections/TextStyleEditor').TextStyle;
}

export interface MediaTextColumnsSection extends BaseSection {
  type: 'mediaTextColumns';
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  mediaPosition: 'left' | 'right';
  enableTitleSpeech: boolean;
  enableDescriptionSpeech: boolean;
  titleTextStyle?: import('@/app/custom_pages/components/sections/TextStyleEditor').TextStyle;
  descriptionTextStyle?: import('@/app/custom_pages/components/sections/TextStyleEditor').TextStyle;
}

export interface TwoColumnTextSection extends BaseSection {
  type: 'twoColumnText';
  leftColumn: string;
  rightColumn: string;
  enableLeftColumnSpeech: boolean;
  enableRightColumnSpeech: boolean;
  leftFontStyle?: 'normal' | 'italic' | 'bold';
  leftFontColor?: string;
  leftFontSize?: string;
  leftTextShadow?: {
    color: string;
    offsetX: string;
    offsetY: string;
    blur: string;
  };
  leftTextOutline?: {
    color: string;
    width: string;
  };
  leftTextBackground?: {
    color: string;
    opacity: number;
    blur: string;
    borderRadius: string;
    padding: string;
  };
  rightFontStyle?: 'normal' | 'italic' | 'bold';
  rightFontColor?: string;
  rightFontSize?: string;
  rightTextShadow?: {
    color: string;
    offsetX: string;
    offsetY: string;
    blur: string;
  };
  rightTextOutline?: {
    color: string;
    width: string;
  };
  rightTextBackground?: {
    color: string;
    opacity: number;
    blur: string;
    borderRadius: string;
    padding: string;
  };
  containerPadding?: string;
  containerMargin?: string;
  horizontalAlignColumns?: 'start' | 'center' | 'end';
  verticalAlignColumns?: 'start' | 'center' | 'end';
  centerColumns?: boolean;
  horizontalPadding?: number;
  verticalPadding?: number;
}

export interface FeatureSection extends BaseSection {
  type: 'feature';
  title: string;
  description: string;
  features: Array<{
    icon: string;
    title: string;
    description: string;
    ctaText?: string;
    ctaUrl?: string;
    ctaOpenInNewTab?: boolean;
    textStyle?: import('@/app/custom_pages/components/sections/TextStyleEditor').TextStyle;
  }>;
  layout: 'grid' | 'list';
  enableTitleSpeech: boolean;
  enableDescriptionSpeech: boolean;
  enableFeatureSpeech: boolean;
  titleTextStyle?: import('@/app/custom_pages/components/sections/TextStyleEditor').TextStyle;
  descriptionTextStyle?: import('@/app/custom_pages/components/sections/TextStyleEditor').TextStyle;
}

export interface SliderSectionType extends BaseSection {
  type: 'slider';
  slides: Array<{
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
  }>;
  autoplay: boolean;
  autoplayDelay: number;
  showNavigation: boolean;
  showPagination: boolean;
  effect: 'slide' | 'fade';
  loop: boolean;
  height: string;
  width: string;
  customWidth?: string;
  enableSpeech: boolean;
  enableTitleSpeech: boolean;
  enableDescriptionSpeech: boolean;
  speechRate?: number;
  speechPitch?: number;
  speechVolume?: number;
  speechVoice?: string;
  horizontalPadding?: number;
  verticalPadding?: number;
}

export interface FeatureCard {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  ctaOpenInNewTab?: boolean;
  textStyle?: import('@/app/custom_pages/components/sections/TextStyleEditor').TextStyle;
}

export interface InfoCard {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  ctaOpenInNewTab: boolean;
  textStyle?: import('@/app/custom_pages/components/sections/TextStyleEditor').TextStyle;
}

export interface InfoCardSection extends BaseSection {
  type: 'info-card';
  backgroundUrl: string;
  numCards: number;
  cards: InfoCard[];
  layout?: 'full-height' | 'centered' | 'tight-wrap';
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundBlur?: string;
  width?: '100vw' | '100%';
  mainTitle?: string;
  mainDescription?: string;
  showMainTitleDescription?: boolean;
  mainTitlePaddingTop?: string;
  mainTitleTextStyle?: import('../components/sections/TextStyleEditor').TextStyle;
  mainDescriptionTextStyle?: import('../components/sections/TextStyleEditor').TextStyle;
  horizontalPadding?: number;
  verticalPadding?: number;
}

export interface FeatureCardGridSection extends BaseSection {
  type: 'feature-card-grid';
  numCards: number;
  cards: FeatureCard[];
}

export interface AdvancedSliderSection extends BaseSection {
  type: 'advanced-slider';
  slides: {
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
    fontStyle?: 'normal' | 'italic' | 'bold';
    fontColor?: string;
    fontSize?: string;
    textShadow?: {
      color: string;
      offsetX: string;
      offsetY: string;
      blur: string;
    };
    textOutline?: {
      color: string;
      width: string;
    };
    textBackground?: {
      color: string;
      opacity: number;
      blur: string;
      borderRadius: string;
      padding: string;
    };
  }[];
  autoplay?: boolean;
  autoplayDelay?: number;
  showNavigation?: boolean;
  showPagination?: boolean;
  effect?: 'slide' | 'fade';
  loop?: boolean;
  height?: string;
  width?: string;
  customWidth?: string;
  horizontalPadding?: number;
  verticalPadding?: number;
}

export interface FooterColumn {
  type: 'text' | 'media';
  content: string;
  title: string;
  enableSpeech: boolean;
  mediaType?: 'image' | 'video';
  titleTextStyle?: import('@/app/custom_pages/components/sections/TextStyleEditor').TextStyle;
  textStyle?: import('@/app/custom_pages/components/sections/TextStyleEditor').TextStyle;
}

import type { ContactFormSection as ContactFormSectionType } from '@/app/custom_contact_section/types';
import type FluxeditaAdvancedFormSection from '@/app/custom_contact_section/FluxeditaAdvancedFormSection';
export interface PrivacySectionType extends BaseSection {
  type: 'privacy';
  content: string;
  textStyle?: import('@/app/custom_pages/components/sections/TextStyleEditor').TextStyle;
  title?: string;
  titleTextStyle?: import('@/app/custom_pages/components/sections/TextStyleEditor').TextStyle;
}

export interface CustomCodeSectionType extends BaseSection {
  type: 'custom-code';
  code: string;
}

export interface MediaCard {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
}

export interface MediaPlaceholderSection extends BaseSection {
  type: 'media-placeholder';
  cards: MediaCard[];
  visibleCount: number;
  currentPage: number;
  horizontalPadding?: number;
  verticalPadding?: number;
}

export interface EditableTitleSectionType extends BaseSection {
  type: 'editable-title';
  title: string;
  slug: string;
  titleTextStyle?: import('../components/sections/TextStyleEditor').TextStyle;
  alignment?: 'left' | 'center' | 'right';
}

export interface TextWithVideoLeftSection extends BaseSection {
  type: 'text-with-video-left';
  title: string;
  tagline: string;
  description: string;
  videoId: string;
  buttonText?: string;
  horizontalPadding?: number; // in rem
  verticalPadding?: number; // in rem
}

export interface TextWithVideoRightSection extends BaseSection {
  type: 'text-with-video-right';
  title: string;
  tagline: string;
  description: string;
  videoId: string;
  buttonText?: string;
  horizontalPadding?: number; // in rem
  verticalPadding?: number; // in rem
}

export interface ProductPackageLeftSection extends BaseSection {
  type: 'product-package-left';
  name: string;
  subtitle: string;
  description: string;
  badge?: string;
  features: string[];
  perfectFor: string[];
  color: string;
  imageSrc: string;
  imageAlt: string;
  videoUrl?: string;
  videoAlt?: string;
  horizontalPadding?: number; // in rem
  verticalPadding?: number; // in rem
  learnMoreText?: string;
  learnMoreUrl?: string;
}

export interface ProductPackageRightSection extends BaseSection {
  type: 'product-package-right';
  name: string;
  subtitle: string;
  description: string;
  badge?: string;
  features: string[];
  perfectFor: string[];
  color: string;
  imageSrc: string;
  imageAlt: string;
  videoUrl?: string;
  videoAlt?: string;
  horizontalPadding?: number; // in rem
  verticalPadding?: number; // in rem
  learnMoreText?: string;
  learnMoreUrl?: string;
}

export interface FooterSection extends BaseSection {
  type: 'footer';
  columns: FooterColumn[];
  numColumns: number;
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
}

export interface MediaStoryCardSectionType extends BaseSection {
  type: 'media-story-cards';
  title?: string;
  titleAlignment?: 'left' | 'center' | 'right';
  cards: Array<{
    id: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    title: string;
    tagline: string;
    thumbnailUrl: string;
    linkUrl?: string;
    linkTarget?: LinkTarget;
  }>;
  columns?: number;
}

export type Section = 
  | HeroSection
  | HeroSectionResponsiveType
  | TextSection
  | ContentSection
  | MediaTextSection
  | DividerSection
  | HeadingSection
  | QuoteSection
  | CTASection
  | GallerySection
  | MediaTextColumnsSection
  | TwoColumnTextSection
  | FeatureSection
  | SliderSectionType
  | FeatureCardGridSection
  | InfoCardSection
  | AdvancedSliderSection
  | ContactFormSectionType
  | { id: string; type: 'fluxedita_advanced_form'; visible: boolean }
  | PrivacySectionType
  | CustomCodeSectionType
  | MediaPlaceholderSection
  | EditableTitleSectionType
  | TextWithVideoLeftSection
  | TextWithVideoRightSection
  | ProductPackageLeftSection
  | ProductPackageRightSection
  | FooterSection
  | MediaStoryCardSectionType;