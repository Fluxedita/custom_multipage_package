export interface Section {
  id: string;
  type: string;
  visible?: boolean;
  [key: string]: any;
}

export interface SliderSectionType extends Section {
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
}

export interface FooterSectionType extends Section {
  type: 'footer';
  numColumns: number;
  columns: Array<{
    type: 'text';
    content: string;
    title: string;
    enableSpeech: boolean;
  }>;
  backgroundColor: string;
  textColor: string;
  padding: string;
}

export interface HeroSectionType extends Section {
  type: 'hero' | 'new_hero';
  title: string;
  description: string;
  backgroundImage?: string;
  backgroundMedia?: string;
  mediaType?: 'image' | 'video';
  height?: string;
  width?: string;
  enableTitleSpeech: boolean;
  enableDescriptionSpeech: boolean;
  enableSpeech: boolean;
  textVerticalAlign?: 'top' | 'middle' | 'bottom';
  textHorizontalAlign?: 'left' | 'center' | 'right';
}

export interface GallerySectionType extends Section {
  type: 'gallery';
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
} 