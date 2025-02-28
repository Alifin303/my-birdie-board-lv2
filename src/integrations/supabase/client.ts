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

// Helper function to format course name for storage and display
export const formatCourseName = (clubName: string, courseName: string) => {
  // Debug log to trace what's being passed to formatCourseName
  console.log("formatCourseName input:", { clubName, courseName });
  
  // If the club name and course name are the same, just use one
  if (clubName === courseName) {
    return clubName;
  }
  // Otherwise format as "Club Name - Course Name"
  const formattedName = `${clubName} - ${courseName}`;
  console.log("Formatted course name:", formattedName);
  return formattedName;
};

// Helper function to parse stored course name back into club and course
export const parseCourseName = (storedName: string): { clubName: string, courseName: string } => {
  console.log("Parsing stored course name:", storedName);
  
  // If the name contains a separator, split it
  if (storedName.includes(' - ')) {
    const [clubName, courseName] = storedName.split(' - ', 2);
    console.log("Parsed course name:", { clubName, courseName });
    return { clubName, courseName };
  }
  
  // If no separator, use the entire name as both club and course name
  console.log("No separator found, using entire name for both club and course");
  return { clubName: storedName, courseName: storedName };
};

// Helper for debugging Supabase operations
export const logSupabaseOperation = (operation: string, data: any, error: any = null) => {
  if (error) {
    console.error(`Supabase ${operation} failed:`, error);
    console.error("Failed operation data:", data);
    return;
  }
  
  console.log(`Supabase ${operation} successful:`, data);
};

// Helper to fetch course details from database
export const fetchCourseById = async (courseId: number) => {
  console.log(`Fetching course details for database ID: ${courseId}`);
  
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();
    
  if (error) {
    console.error("Error fetching course:", error);
    return null;
  }
  
  console.log("Course data from database:", data);
  
  // Parse the stored name
  if (data && data.name) {
    const parsedName = parseCourseName(data.name);
    console.log("Database course with parsed name:", {
      ...data,
      ...parsedName
    });
    return {
      ...data,
      ...parsedName
    };
  }
  
  return data;
};
