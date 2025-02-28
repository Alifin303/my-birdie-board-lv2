
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = 'https://rbhzesocmhazynkfyhst.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiaHplc29jbWhhenlua2Z5aHN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1NTcwMDUsImV4cCI6MjA1NjEzMzAwNX0.ckHTv_xaARz6GXc1bWiQ95NleVW2TMaqBzaKzMCiVZ0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to parse course name
export function parseCourseName(fullName: string): { clubName: string; courseName: string } {
  if (!fullName) return { clubName: 'Unknown Club', courseName: 'Unknown Course' };
  
  // Check if the name contains " - " which separates club name from course name
  const parts = fullName.split(' - ');
  
  if (parts.length > 1) {
    // If we have multiple parts, first part is club name, rest combined is course name
    const clubName = parts[0].trim();
    const courseName = parts.slice(1).join(' - ').trim();
    return { clubName, courseName };
  } else {
    // If no separator, use the whole string as both club and course name
    return { clubName: fullName.trim(), courseName: fullName.trim() };
  }
}

// Helper function to format course name for database storage
export function formatCourseName(clubName: string, courseName: string): string {
  if (!clubName && !courseName) return '';
  if (!clubName) return courseName;
  if (!courseName || clubName === courseName) return clubName;
  
  return `${clubName} - ${courseName}`;
}

export type DatabaseError = {
  code: string;
  details: string;
  hint: string;
  message: string;
};
