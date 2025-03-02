
import { 
  getCourseDetails, 
  getCourseHoles
} from "@/services/golfCourseApi";
import { getCourseMetadataFromLocalStorage } from "@/integrations/supabase/client";
import { UseCourseHandlersProps } from "./types";
import { SimplifiedGolfCourse } from "../../types";

export function createCourseSelectionHandlers({
  setIsLoading,
  setSelectedCourse,
  setSelectedTeeId,
  setScores,
  setManualCourseOpen,
  setSearchResults,
  toast
}: Pick<UseCourseHandlersProps, 
  'setIsLoading' | 
  'setSelectedCourse' | 
  'setSelectedTeeId' |
  'setScores' | 
  'setManualCourseOpen' |
  'setSearchResults' |
  'toast'
>) {
  
  const handleCourseSelect = async (course: SimplifiedGolfCourse) => {
    const { id: courseId, name: courseName, clubName } = course;
    const isUserAdded = course.isUserAdded || false;
    const apiCourseId = course.apiCourseId;
    
    console.log("handleCourseSelect called with:", { courseId, courseName, clubName, isUserAdded, apiCourseId });
    
    try {
      setIsLoading(true);
      setSelectedCourse(null);
      setSelectedTeeId(null);
      setScores([]);
      
      let simplifiedCourseDetail;
      
      // First, try to load course details from localStorage
      try {
        const storedCourseDetails = getCourseMetadataFromLocalStorage(courseId);
        
        if (storedCourseDetails) {
          console.log("Found stored course details:", storedCourseDetails);
          simplifiedCourseDetail = storedCourseDetails;
        }
      } catch (error) {
        console.error("Error loading from localStorage:", error);
      }
      
      if (!simplifiedCourseDetail) {
        console.log("No stored course details found, fetching from API");
        
        if (isUserAdded) {
          // For user-added courses, we need to create default data
          console.log("Creating default data for user-added course:", courseName);
          
          const defaultHoles = Array.from({ length: 18 }, (_, i) => ({
            number: i + 1,
            par: i % 3 === 0 ? 5 : (i % 3 === 1 ? 4 : 3), // Alternating par 5, 4, 3
            handicap: i + 1,
            yards: {
              pro: 0,
              champion: 0,
              men: i % 3 === 0 ? 520 : (i % 3 === 1 ? 400 : 180),
              women: i % 3 === 0 ? 480 : (i % 3 === 1 ? 370 : 160)
            }
          }));
          
          // Create multiple tee options for user-added courses with proper defaults
          const defaultTees = [
            {
              id: `tee-white-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
              name: 'White',
              rating: 72,
              slope: 113,
              par: 72,
              gender: 'male' as const,
              originalIndex: 0,
              holes: defaultHoles.map(hole => ({...hole}))
            },
            {
              id: `tee-yellow-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
              name: 'Yellow',
              rating: 71,
              slope: 112,
              par: 72,
              gender: 'male' as const,
              originalIndex: 1,
              holes: defaultHoles.map(hole => ({...hole}))
            },
            {
              id: `tee-red-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
              name: 'Red',
              rating: 70,
              slope: 110,
              par: 72, 
              gender: 'female' as const,
              originalIndex: 2,
              holes: defaultHoles.map(hole => ({...hole}))
            }
          ];
          
          simplifiedCourseDetail = {
            id: courseId,
            name: courseName,
            clubName: clubName,
            city: "",
            state: "",
            tees: defaultTees,
            holes: defaultHoles,
            isUserAdded: true
          };
          
          try {
            localStorage.setItem(
              `course_details_${courseId}`, 
              JSON.stringify(simplifiedCourseDetail)
            );
            console.log("Saved default course details to localStorage with multiple tees:", simplifiedCourseDetail);
          } catch (e) {
            console.error("Error saving to localStorage:", e);
          }
        } else if (apiCourseId) {
          // For API-sourced courses, fetch from API
          console.log("Fetching course details from API for course ID:", apiCourseId);
          try {
            const courseDetail = await getCourseDetails(apiCourseId);
            console.log("API returned course details:", courseDetail);
            
            // Flatten the API response into a simpler object
            const flattenedDetails = flattenCourseDetailsFromAPI(courseDetail, clubName, courseName);
            console.log("Flattened course details:", flattenedDetails);
            
            // Fetch hole data
            const holesData = await getCourseHoles(apiCourseId);
            console.log("API returned holes data:", holesData);
            
            // Combine the data
            simplifiedCourseDetail = {
              ...flattenedDetails,
              id: courseId,
              apiCourseId: apiCourseId,
              holes: holesData.holes || [],
              isUserAdded: false
            };
            
            // Cache the results
            try {
              localStorage.setItem(
                `course_details_${courseId}`, 
                JSON.stringify(simplifiedCourseDetail)
              );
              console.log("Saved API course details to localStorage");
            } catch (e) {
              console.error("Error saving API details to localStorage:", e);
            }
          } catch (error: any) {
            console.error("Error fetching course details from API:", error);
            if (toast) {
              toast({
                title: "API Error",
                description: error.message || "Could not fetch course details. Check the console for more information.",
                variant: "destructive",
              });
            }
            
            // Create fallback data if API fails
            const fallbackData = createFallbackCourseData(courseId, courseName, clubName);
            simplifiedCourseDetail = fallbackData;
          }
        } else {
          console.error("Invalid course selection: Not user-added and no API ID provided");
          if (toast) {
            toast({
              title: "Error",
              description: "Invalid course selection. Please try again.",
              variant: "destructive",
            });
          }
          setIsLoading(false);
          return;
        }
      }
      
      if (!simplifiedCourseDetail) {
        console.error("Failed to load course details");
        if (toast) {
          toast({
            title: "Error",
            description: "Failed to load course details. Please try again.",
            variant: "destructive",
          });
        }
        setIsLoading(false);
        return;
      }
      
      console.log("Final course detail to be set:", simplifiedCourseDetail);
      
      if (!simplifiedCourseDetail.tees || simplifiedCourseDetail.tees.length === 0) {
        console.error("No tees found for course:", simplifiedCourseDetail);
        if (toast) {
          toast({
            title: "Error",
            description: "No tee information found for this course. Please try another course.",
            variant: "destructive",
          });
        }
        setIsLoading(false);
        return;
      }
      
      // Select the first tee by default
      const defaultTeeId = simplifiedCourseDetail.tees[0].id;
      
      // Ensure consistent structure in the tees data
      const formattedTees = simplifiedCourseDetail.tees.map(tee => ({
        ...tee,
        holes: tee.holes || simplifiedCourseDetail.holes.map(hole => ({
          ...hole,
          yards: typeof hole.yards === 'object' 
            ? hole.yards.men || 0 
            : (hole.yards || 0)
        }))
      }));
      
      const updatedCourseDetail = {
        ...simplifiedCourseDetail,
        tees: formattedTees
      };
      
      console.log("Default tee ID:", defaultTeeId);
      console.log("Setting selected course and tee with corrected structure:", updatedCourseDetail);
      
      setSelectedCourse(updatedCourseDetail);
      
      // Use setTimeout to ensure component has processed the course update first
      setTimeout(() => {
        console.log("Setting initial tee ID");
        setSelectedTeeId(defaultTeeId);
        console.log("Selected course after update:", updatedCourseDetail);
        console.log("Selected tee ID after update:", defaultTeeId);
        console.log("Selected tee name:", updatedCourseDetail.tees[0]?.name);
      }, 200); // Increased delay to ensure state updates are processed
    } catch (error: any) {
      console.error("Error in handleCourseSelect:", error);
      if (toast) {
        toast({
          title: "Error",
          description: error.message || "An error occurred while selecting the course",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenManualCourseForm = () => {
    setManualCourseOpen(true);
    setSearchResults([]);
  };
  
  const handleCourseCreated = (courseData: { 
    id: number; 
    name: string; 
    clubName: string; 
    city?: string; 
    state?: string;
    tees: any[];
    holes: any[];
  }) => {
    console.log("Course created, data:", courseData);
    
    // Format the course data for consistency
    const formattedCourse = {
      ...courseData,
      isUserAdded: true
    };
    
    setSelectedCourse(formattedCourse);
    
    if (courseData.tees && courseData.tees.length > 0) {
      const defaultTee = courseData.tees[0];
      setSelectedTeeId(defaultTee.id);
      
      console.log("Setting tee from created course:", defaultTee);
    } else {
      console.error("No tees found in created course");
    }
  };
  
  // Helper functions for course handling
  
  const flattenCourseDetailsFromAPI = (courseDetail: any, clubName: string, courseName: string) => {
    // A utility function to convert API course details to our simplified format
    const maleTees = courseDetail.tees?.male || [];
    const femaleTees = courseDetail.tees?.female || [];
    
    const flattenedTees = [
      ...maleTees.map((tee: any, index: number) => ({
        id: `tee-male-${index}-${Date.now()}`,
        name: tee.tee_name || `Men's Tee ${index + 1}`,
        rating: tee.course_rating || 72,
        slope: tee.slope_rating || 113,
        par: tee.par_total || 72,
        gender: 'male' as const,
        originalIndex: index,
        yards: tee.total_yards,
        holes: tee.holes || []
      })),
      ...femaleTees.map((tee: any, index: number) => ({
        id: `tee-female-${index}-${Date.now()}`,
        name: tee.tee_name || `Women's Tee ${index + 1}`,
        rating: tee.course_rating || 72,
        slope: tee.slope_rating || 113,
        par: tee.par_total || 72,
        gender: 'female' as const,
        originalIndex: index,
        yards: tee.total_yards,
        holes: tee.holes || []
      }))
    ];
    
    return {
      name: courseName,
      clubName: clubName,
      city: courseDetail.location?.city || "",
      state: courseDetail.location?.state || "",
      country: courseDetail.location?.country || "",
      tees: flattenedTees,
      holes: []
    };
  };
  
  // Helper function to create fallback course data
  const createFallbackCourseData = (courseId: number, courseName: string, clubName: string) => {
    console.log("Creating fallback data for course:", courseName);
    
    const defaultHoles = Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: i % 3 === 0 ? 5 : (i % 3 === 1 ? 4 : 3), // Alternating par 5, 4, 3
      handicap: i + 1,
      yards: (i % 3 === 0 ? 520 : (i % 3 === 1 ? 400 : 180))
    }));
    
    return {
      id: courseId,
      name: courseName,
      clubName: clubName,
      city: "",
      state: "",
      tees: [
        {
          id: `tee-fallback-${Date.now()}`,
          name: 'White',
          rating: 72,
          slope: 113,
          par: 72,
          gender: 'male' as const,
          originalIndex: 0,
          holes: defaultHoles
        }
      ],
      holes: defaultHoles,
      isUserAdded: false
    };
  };

  return {
    handleCourseSelect,
    handleOpenManualCourseForm,
    handleCourseCreated
  };
}
