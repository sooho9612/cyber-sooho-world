export interface MemoryPhoto {
  id: string;
  image: string;
  caption: string;
}

export interface DiaryEntry {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  content: string;
  imageUrl?: string;
  image_url?: string;
  gallery?: MemoryPhoto[];
  background_url?: string;
  background_style?: 'tile' | 'stretch';
  photo_count?: number;
  created_at?: string;
}

export interface FoodEntry {
  id: string;
  title: string;
  restaurant: string;
  date: string;
  time: string;
  location: string;
  content: string;
  rating: number;
  price: string;
  imageUrl?: string;
}

export interface GuestbookEntry {
  id: number;
  created_at: string;
  nickname: string;
  message: string;
  parent_id?: number | null;
}

export interface HomePost {
  id: number;
  created_at: string;
  title: string;
  content: string;
  image_url?: string;
}

export interface HomeComment {
  id: number;
  created_at: string;
  post_id: number;
  nickname: string;
  content: string;
}

export interface MovieEntry {
  id: string;
  movie_title: string;
  review_line: string;
  date: string;
  time: string;
  poster_url: string;
  still_cuts: string[];
  rating: number;
  content: string;
}

export interface TravelEntry {
  id: string;
  title: string;
  country: string;
  region: string;
  date: string;
  thumbnail_url: string;
  body_images: string[];
  content: string;
  gallery?: MemoryPhoto[];
  background_url?: string;
  background_style?: 'tile' | 'stretch';
  /** Denormalized for list projection (avoid loading full gallery JSON) */
  photo_count?: number;
  created_at?: string;
}

export interface MemoryEntry {
  id: string;
  title: string;
  date: string;
  location: string;
  gallery: MemoryPhoto[];
  image_url?: string;
  background_url?: string;
  background_style?: 'tile' | 'stretch';
  photo_count?: number;
  created_at?: string;
}

export interface MusicTrack {
  id: number;
  title: string;
  url: string;
  folder: string;
  created_at?: string;
}

export type AppTab =
  | 'intro'
  | 'home'
  | 'diary'
  | 'guestbook'
  | 'food'
  | 'music'
  | 'movie'
  | 'travel'
  | 'toy';

/** Outer desktop background (WindowFrame .desktop-bg only) */
export type DesktopBgColor = {
  mode: 'color';
  color: string;
};

export type DesktopBgImage = {
  mode: 'image';
  imageUrl: string;
  imageStyle: 'tile' | 'stretch';
};

export type DesktopBg = DesktopBgColor | DesktopBgImage;

/** Reserved for future inner-window background settings */
export type WindowBg = DesktopBg | null;

export interface UserSettingsRow {
  nickname: string;
  desktop_bg: DesktopBg;
  window_bg: WindowBg;
  updated_at?: string;
}

/** Site-wide image auto-compressor (Control Panel) */
export type CompressorSettings = {
  enabled: boolean;
  maxEdge: number;
  quality: number;
};

/** Site-wide marquee / 현수막 (Control Panel) */
export type MarqueeSettings = {
  text: string;
  /** 1 (slow) – 10 (fast) */
  speed: number;
  backgroundColor: string;
  textColor: string;
  /** Full-sat cycling hue text animation */
  rainbow: boolean;
  bold: boolean;
  underline: boolean;
  italic: boolean;
  /** Font size in px (approx. 10–32) */
  fontSize: number;
};

/** homepage_settings singleton row */
export interface HomepageSettingsRow {
  id: number;
  compressor: CompressorSettings;
  marquee?: MarqueeSettings;
  updated_at?: string;
}
