// src/types/index.ts

// [New] 사진+캡션 구조체 정의 (공용 사용)
export interface MemoryPhoto {
  id: string;      // 사진 식별용 (프론트엔드 key용)
  image: string;   // 이미지 데이터 (Base64 string or URL)
  caption: string; // 캡션
}

export interface DiaryEntry {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  content: string;
  imageUrl?: string; // DB: image_url (레거시 지원용)
  
  // [New] 새로운 에디터 기능을 위한 필드 추가
  gallery?: MemoryPhoto[]; // 사진+캡션 갤러리
  background_url?: string; // 배경 이미지
  background_style?: 'tile' | 'stretch'; // 배경 스타일
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
  imageUrl?: string; // DB: image_url
}

export interface GuestbookEntry {
  id: string;
  created_at: string;
  nickname: string;
  message: string;
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
  still_cuts: string[]; // DB: text[]
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
  body_images: string[]; // DB: text[]
  content: string;
}

// [New] MemoryEntry 정의
export interface MemoryEntry {
  id: string;
  title: string;
  date: string;
  location: string;
  gallery: MemoryPhoto[]; // 기존 content, image_url 대신 사용
  
  // [New] 배경화면 기능 추가
  background_url?: string;
  background_style?: 'tile' | 'stretch';
  
  // 하위 호환성을 위해 남겨둘 수 있음 (선택사항)
  created_at?: string;
}