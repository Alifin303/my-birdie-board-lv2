
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
  },
  global: {
    headers: {
      'x-application-name': 'birdieboard'
    }
  },
  // Correctly configuring redirectUrl at the component level when using auth methods
});
