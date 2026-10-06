// 기존 타입들... (FoodEntry, GuestbookEntry 등)

// [New] 뮤직 트랙 타입 추가
export interface MusicTrack {
  id: number;
  title: string;
  url: string;
  folder: string;
  created_at?: string;
}