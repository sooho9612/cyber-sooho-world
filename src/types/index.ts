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
  gallery?: MemoryPhoto[];
  background_url?: string;
  background_style?: 'tile' | 'stretch';
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
}

export interface MemoryEntry {
  id: string;
  title: string;
  date: string;
  location: string;
  gallery: MemoryPhoto[];
  background_url?: string;
  background_style?: 'tile' | 'stretch';
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
