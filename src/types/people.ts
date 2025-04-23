export interface Person {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
  relationship: string;
  interests: string[];
  created_at: string;
  updated_at: string;
}

export interface ImportantDate {
  id: string;
  person_id: string;
  title: string;
  date: string;
  created_at: string;
}

export interface PersonFormData {
  name: string;
  avatar_url: string | null;
  relationship: string;
  interests: string[];
  dates: {
    title: string;
    date: string;
  }[];
}

export const RELATIONSHIPS = [
  'Parent',
  'Child',
  'Sibling',
  'Partner',
  'Friend',
  'Colleague',
  'Other'
] as const;

export type Relationship = typeof RELATIONSHIPS[number];