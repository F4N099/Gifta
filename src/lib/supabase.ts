import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single supabase instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to format search URLs
export const formatSearchUrl = (title: string, source: 'Amazon' | 'Etsy'): string => {
  const searchQuery = encodeURIComponent(title.trim());
  
  if (source === 'Amazon') {
    const lang = document.documentElement.lang.split('-')[0] || 'it';
    const domain = lang === 'en' ? 'com' : lang;
    return `https://www.amazon.${domain}/s?k=${searchQuery}`;
  }
  
  return `https://www.etsy.com/search?q=${searchQuery}`;
};