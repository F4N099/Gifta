export interface GiftSuggestion {
  emoji: string;
  title: string;
  price: number;
  description: string;
  topics: string[];
  buyLink: string;
  source: 'Amazon' | 'Etsy';
}

export interface GiftRequestParams {
  description: string;
  interests: string[];
  budget: number;
}

export interface GiftResponse {
  suggestions: GiftSuggestion[];
}

export interface SavedGift extends Omit<GiftSuggestion, 'isSaved'> {
  id: string;
  user_id: string;
  created_at: string;
}