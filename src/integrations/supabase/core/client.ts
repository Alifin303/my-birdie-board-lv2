
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = 'https://rbhzesocmhazynkfyhst.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiaHplc29jbWhhenlua2Z5aHN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1NTcwMDUsImV4cCI6MjA1NjEzMzAwNX0.ckHTv_xaARz6GXc1bWiQ95NleVW2TMaqBzaKzMCiVZ0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get the site URL for authentication redirects
export function getSiteUrl(): string {
  // In a production environment, you'd want to use window.location.origin
  // For development, we'll return a hardcoded value
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:5173'; // Default for development
}

// Helper function to log Supabase operations for debugging
export function logSupabaseOperation(operation: string, data: any): void {
  console.log(`[Supabase ${operation}]`, data);
}

export type DatabaseError = {
  code: string;
  details: string;
  hint: string;
  message: string;
};
