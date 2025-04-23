import { Profile } from '../lib/supabase';

export const mockProfile: Profile = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  name: 'John Doe',
  avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const mockGiftSuggestions = [
  {
    emoji: '🎮',
    title: 'Nintendo Switch OLED',
    price: 349,
    description: 'Latest Nintendo gaming console with vibrant OLED screen',
    longDescription: 'The Nintendo Switch OLED Model features a vibrant 7-inch OLED screen, enhanced audio, and a wide adjustable stand. Perfect for both handheld and TV gaming modes.',
    topics: ['Gaming', 'Tech', 'Entertainment'],
    buyLink: 'https://www.amazon.it/s?k=nintendo+switch+oled',
    source: 'Amazon' as const
  },
  {
    emoji: '🎨',
    title: 'Custom Digital Portrait',
    price: 85,
    description: 'Personalized digital artwork in your preferred style',
    longDescription: 'A professional artist will create a custom digital portrait in your chosen style. Perfect for unique gifts or personal art collection. Includes multiple revisions and high-resolution files.',
    topics: ['Art', 'Custom', 'Creative'],
    buyLink: 'https://www.etsy.com/search?q=custom+digital+portrait',
    source: 'Etsy' as const
  },
  {
    emoji: '📚',
    title: 'Kindle Paperwhite',
    price: 189,
    description: 'Premium e-reader with auto-adjusting light',
    longDescription: 'The latest Kindle Paperwhite features a 6.8" display, wireless charging, auto-adjusting front light, and 32 GB storage. Perfect for avid readers.',
    topics: ['Books', 'Tech', 'Reading'],
    buyLink: 'https://www.amazon.it/s?k=kindle+paperwhite',
    source: 'Amazon' as const
  }
];