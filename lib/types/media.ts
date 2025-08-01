export interface MediaItem {
  id: string;
  public_id: string;
  url: string;
  secure_url: string;
  name: string;
  type: 'image' | 'video';
  resource_type?: 'image' | 'video';
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  created_at: string;
  tags?: string[];
  context?: Record<string, unknown>;
  size?: number;
  asset_id?: string;
}

export interface MediaLibraryProps {
  onSelectAction: (url: string, type: 'image' | 'video') => void;
  onCloseAction?: () => void;
  className?: string;
  selectedUrl?: string;
  isDialog?: boolean;
  type?: 'image' | 'video' | 'all';
  maxResults?: number;
}
