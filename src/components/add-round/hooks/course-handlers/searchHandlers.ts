
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
      console.log("Database search results:", dbResults);
      
      const userAddedCourses = dbResults.map(course => ({
        id: typeof course.id === 'string' ? parseInt(course.id) : course.id,
        name: course.name || '',
        clubName: course.name?.split(' - ')[0] || course.name || '',
        city: course.city || '',
        state: course.state || '',
        country: 'United States',
        isUserAdded: true,
        api_course_id: course.api_course_id || null
      }));
      
      // Then search the API
      const apiResponse = await searchCourses(query);
      console.log("API search response:", apiResponse);
      
      const apiResults = Array.isArray(apiResponse.results) ? apiResponse.results : [];
      console.log("API search results:", apiResults);
      
      const apiCourses = apiResults.map(course => ({
        id: typeof course.id === 'string' ? parseInt(course.id) : course.id,
        name: course.course_name || (course as any).name || '',
        clubName: course.club_name || (course as any).name || '',
        city: course.location?.city || '',
        state: course.location?.state || '',
        country: course.location?.country || 'United States',
        isUserAdded: false,
        apiCourseId: course.id?.toString()
      }));
      
      const combinedResults = [...userAddedCourses, ...apiCourses];
      console.log("Combined search results:", combinedResults);
      
      const enhancedResults = enhanceCourseResults(combinedResults);
      
      setSearchResults(enhancedResults);
      setNoResults(enhancedResults.length === 0);
    } catch (error: any) {
      console.error("Search error:", error);
      setSearchError(error.message || "Failed to fetch courses. Please try again.");
      
      try {
        // Fallback to just local database search
        const { data } = await searchDatabaseCourses(query);
        console.log("Fallback database search results:", data);
        
        const userAddedCourses = (data || []).map(course => ({
          id: typeof course.id === 'string' ? parseInt(course.id) : course.id,
          name: course.name || '',
          clubName: course.name?.split(' - ')[0] || course.name || '',
          city: course.city || '',
          state: course.state || '',
          country: 'United States',
          isUserAdded: true,
          api_course_id: course.api_course_id || null
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
