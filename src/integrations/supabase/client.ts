
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

// Helper function to fetch a course by ID
export async function fetchCourseById(courseId: number): Promise<any> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();
  
  if (error) {
    console.error("Error fetching course by ID:", error);
    throw error;
  }
  
  return data;
}

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

// Helper function to check if a course is user-added
export function isUserAddedCourse(courseName: string): boolean {
  return courseName.includes('[User added course]');
}

// Helper function to get course metadata from localStorage
export function getCourseMetadataFromLocalStorage(courseId: number | string): any {
  try {
    // Normalize courseId to string for consistent key lookup
    const courseIdStr = courseId.toString();
    
    // Try different possible storage keys
    const courseDetailsKey = `course_details_${courseIdStr}`;
    const courseMetadataKey = `course_metadata_${courseIdStr}`;
    
    // Get stored details
    const storedDetails = localStorage.getItem(courseDetailsKey) || localStorage.getItem(courseMetadataKey);
    
    if (!storedDetails) {
      return null;
    }
    
    return JSON.parse(storedDetails);
  } catch (error) {
    console.error("Error getting course metadata from localStorage:", error);
    return null;
  }
}

export type DatabaseError = {
  code: string;
  details: string;
  hint: string;
  message: string;
};
