
import { searchCourses } from "@/services/golfCourseApi";
import { fetchUserAddedCourses, enhanceCourseResults } from "../../utils/courseUtils";
import { UseCourseHandlersProps } from "./types";
import { searchCourses as searchDatabaseCourses } from "@/integrations/supabase/course/course-queries";

export function createSearchHandlers({
  setIsLoading,
  setSearchError,
  setNoResults,
  setSearchResults,
  toast
}: Pick<UseCourseHandlersProps, 'setIsLoading' | 'setSearchError' | 'setNoResults' | 'setSearchResults' | 'toast'>) {
  
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setNoResults(false);
      return;
    }
    
    setIsLoading(true);
    setSearchError(null);
    setNoResults(false);
    
    try {
      // Search local database first (now includes name, city, state)
      const dbResponse = await searchDatabaseCourses(query);
      const dbResults = dbResponse.data || [];
      const userAddedCourses = dbResults.map(course => ({
        id: typeof course.id === 'string' ? parseInt(course.id) : course.id,
        name: course.name || '',
        clubName: course.name?.split(' - ')[0] || course.name || '',
        city: course.city || '',
        state: course.state || '',
        country: 'United States',
        isUserAdded: !course.api_course_id, // Only true for manually added courses
        isApiCourse: !!course.api_course_id, // New flag to identify API courses in DB
        apiCourseId: course.api_course_id || undefined, // Make sure we keep track of the API ID
      }));
      
      // Then search the API for additional courses
      const apiResponse = await searchCourses(query);
      const apiResults = Array.isArray(apiResponse.results) ? apiResponse.results : [];
      
      // Remove API courses that are already in our database to avoid duplicates
      const dbApiCourseIds = new Set(dbResults
        .filter(course => course.api_course_id)
        .map(course => course.api_course_id));
      
      const filteredApiResults = apiResults.filter(course => 
        !dbApiCourseIds.has(course.id?.toString()));
      
      const combinedResults = [
        ...userAddedCourses, 
        ...filteredApiResults.map(course => ({
          id: typeof course.id === 'string' ? parseInt(course.id) : course.id,
          name: course.course_name || (course as any).name || '',
          clubName: course.club_name || (course as any).name || '',
          city: course.location?.city || '',
          state: course.location?.state || '',
          country: course.location?.country || 'United States',
          isUserAdded: false,
          isApiCourse: true,
          apiCourseId: course.id?.toString()
        }))
      ];
      
      const enhancedResults = enhanceCourseResults(combinedResults);
      
      setSearchResults(enhancedResults);
      setNoResults(enhancedResults.length === 0);
    } catch (error: any) {
      console.error("Search error:", error);
      setSearchError(error.message || "Failed to fetch courses. Please try again.");
      
      try {
        // Fallback to just local database search
        const { data } = await searchDatabaseCourses(query);
        const userAddedCourses = (data || []).map(course => ({
          id: typeof course.id === 'string' ? parseInt(course.id) : course.id,
          name: course.name || '',
          clubName: course.name?.split(' - ')[0] || course.name || '',
          city: course.city || '',
          state: course.state || '',
          country: 'United States',
          isUserAdded: !course.api_course_id,
          isApiCourse: !!course.api_course_id,
          apiCourseId: course.api_course_id || undefined,
        }));
        
        if (userAddedCourses.length > 0) {
          setSearchResults(userAddedCourses);
          setNoResults(false);
        } else {
          setNoResults(true);
        }
      } catch (err) {
        console.error("Failed to get user-added courses as fallback:", err);
        setNoResults(true);
      }
      
      toast.toast({
        title: "API Error",
        description: error.message || "Failed to fetch courses from API. Showing local courses only.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSearch };
}
