
import { searchCourses } from "@/services/golfCourseApi";
import { fetchUserAddedCourses, enhanceCourseResults } from "../../utils/courseUtils";
import { UseCourseHandlersProps } from "./types";

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
      const apiResponse = await searchCourses(query);
      const apiResults = Array.isArray(apiResponse.results) ? apiResponse.results : [];
      
      const userAddedCourses = await fetchUserAddedCourses(query);
      
      const combinedResults = [
        ...userAddedCourses, 
        ...apiResults.map(course => ({
          id: typeof course.id === 'string' ? parseInt(course.id) : course.id,
          name: course.course_name || (course as any).name || '',
          clubName: course.club_name || (course as any).name || '',
          city: course.location?.city || '',
          state: course.location?.state || '',
          country: course.location?.country || 'United States',
          isUserAdded: false,
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
        const userAddedCourses = await fetchUserAddedCourses(query);
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
