
import { createClient } from '@supabase/supabase-js';

// Get the current domain instead of hardcoding URLs
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : '';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rbhzesocmhazynkfyhst.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiaHplc29jbWhhenlua2Z5aHN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1NTcwMDUsImV4cCI6MjA1NjEzMzAwNX0.ckHTv_xaARz6GXc1bWiQ95NleVW2TMaqBzaKzMCiVZ0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: true,
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  },
  global: {
    headers: {
      'x-application-name': 'birdieboard'
    }
  },
});

// Export a function to get the site URL that can be used across the app
export const getSiteUrl = () => {
  // For server-side code (during build time), provide a fallback
  if (typeof window === 'undefined') {
    return process.env.SITE_URL || 'https://your-production-url.com';
  }
  
  // For client-side code, use the current origin
  return window.location.origin;
};
