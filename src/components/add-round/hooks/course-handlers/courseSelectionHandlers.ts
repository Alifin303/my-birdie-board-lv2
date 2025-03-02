
import { getCourseDetails, CourseDetail } from "@/services/golfCourseApi";
import { loadUserAddedCourseDetails } from "../../utils/courseUtils";
import { convertToSimplifiedCourseDetail } from "../../utils/courseUtils";
import { SimplifiedGolfCourse, SimplifiedCourseDetail } from "../../types";
import { UseCourseHandlersProps } from "./types";
import { fetchCourseById, getCourseMetadataFromLocalStorage } from "@/integrations/supabase/client";

export function createCourseSelectionHandlers({
  setIsLoading,
  setSearchError,
  setSelectedCourse,
  setSearchResults,
  setSearchQuery,
  setSelectedTeeId,
  updateScorecardForTee,
  setHoleSelection,
  setCurrentStep,
  setOriginalCourseDetail,
  setManualCourseOpen,
  toast
}: Pick<UseCourseHandlersProps, 
  'setIsLoading' | 
  'setSearchError' | 
  'setSelectedCourse' | 
  'setSearchResults' | 
  'setSearchQuery' |
  'setSelectedTeeId' | 
  'updateScorecardForTee' | 
  'setHoleSelection' | 
  'setCurrentStep' |
  'setOriginalCourseDetail' |
  'setManualCourseOpen' |
  'toast'
>) {
  
  const handleCourseSelect = async (course: SimplifiedGolfCourse) => {
    setIsLoading(true);
    setSearchError(null);
    
    try {
      console.log("Selected course:", course);
      
      let simplifiedCourseDetail: SimplifiedCourseDetail;
      
      if (course.isUserAdded) {
        console.log("Loading user-added course from database:", course);
        
        // First check localStorage for cached course details
        const cachedCourseDetail = loadUserAddedCourseDetails(course.id);
        
        if (cachedCourseDetail) {
          console.log("User-added course details loaded from cache:", cachedCourseDetail);
          
          cachedCourseDetail.id = course.id;
          cachedCourseDetail.name = course.name;
          cachedCourseDetail.clubName = course.clubName;
          cachedCourseDetail.city = course.city;
          cachedCourseDetail.state = course.state;
          cachedCourseDetail.isUserAdded = true;
          
          // Make sure we have at least one tee and all tees have proper hole data
          if (!cachedCourseDetail.tees || cachedCourseDetail.tees.length === 0) {
            console.log("No tees found in cached course details, creating default tee");
            
            const defaultHoles = Array(18).fill(null).map((_, idx) => ({
              number: idx + 1,
              par: 4,
              yards: 400,
              handicap: idx + 1
            }));
            
            cachedCourseDetail.tees = [{
              id: `tee-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              name: 'White',
              rating: 72,
              slope: 113,
              par: 72,
              gender: 'male' as const,
              originalIndex: 0,
              holes: defaultHoles
            }];
            
            cachedCourseDetail.holes = defaultHoles;
            
            // Update localStorage with fixed data
            try {
              localStorage.setItem(
                `course_details_${course.id}`, 
                JSON.stringify(cachedCourseDetail)
              );
              console.log("Updated course details with default tee in localStorage");
            } catch (e) {
              console.error("Error saving to localStorage:", e);
            }
          } else {
            // Ensure all tees have proper hole data
            cachedCourseDetail.tees.forEach(tee => {
              if (!tee.holes || tee.holes.length === 0) {
                console.log(`Tee ${tee.name} has no hole data, creating defaults`);
                tee.holes = Array(18).fill(null).map((_, idx) => ({
                  number: idx + 1,
                  par: 4,
                  yards: 400,
                  handicap: idx + 1
                }));
              } else if (tee.holes.length < 18) {
                console.log(`Tee ${tee.name} has incomplete hole data (${tee.holes.length}/18), filling in missing holes`);
                // Add missing holes
                const existingHoleNumbers = tee.holes.map(h => h.number);
                for (let i = 1; i <= 18; i++) {
                  if (!existingHoleNumbers.includes(i)) {
                    tee.holes.push({
                      number: i,
                      par: 4,
                      yards: 400,
                      handicap: i
                    });
                  }
                }
                // Sort holes by number
                tee.holes.sort((a, b) => a.number - b.number);
              }
              
              // Ensure all holes have par values
              tee.holes.forEach(hole => {
                if (!hole.par) hole.par = 4;
                if (!hole.yards) hole.yards = 400;
                if (!hole.handicap) hole.handicap = hole.number <= 9 ? hole.number : hole.number - 9;
              });
            });
            
            // Update localStorage with fixed data
            try {
              localStorage.setItem(
                `course_details_${course.id}`, 
                JSON.stringify(cachedCourseDetail)
              );
              console.log("Updated course details with fixed tee data in localStorage");
            } catch (e) {
              console.error("Error saving to localStorage:", e);
            }
          }
          
          simplifiedCourseDetail = cachedCourseDetail;
        } else {
          console.log("No cached details found for user-added course, creating defaults");
          
          // Try to get metadata from localStorage using the course-utils function
          const metadata = getCourseMetadataFromLocalStorage(course.id);
          console.log("Metadata from localStorage:", metadata);
          
          const defaultHoles = Array(18).fill(null).map((_, idx) => ({
            number: idx + 1,
            par: 4,
            yards: 400,
            handicap: idx + 1
          }));
          
          const teeId = `tee-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          console.log("Generated new tee ID:", teeId);
          
          // Create multiple tee options for user-added courses as a better default
          const defaultTees = [
            {
              id: `tee-white-${Date.now()}`,
              name: 'White',
              rating: 72,
              slope: 113,
              par: 72,
              gender: 'male' as const,
              originalIndex: 0,
              holes: defaultHoles.map(hole => ({...hole}))
            },
            {
              id: `tee-blue-${Date.now()}`,
              name: 'Blue',
              rating: 74,
              slope: 115,
              par: 72,
              gender: 'male' as const,
              originalIndex: 1,
              holes: defaultHoles.map(hole => ({...hole}))
            },
            {
              id: `tee-red-${Date.now()}`,
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
            id: course.id,
            name: course.name,
            clubName: course.clubName,
            city: course.city,
            state: course.state,
            tees: defaultTees,
            holes: defaultHoles,
            isUserAdded: true
          };
          
          try {
            localStorage.setItem(
              `course_details_${course.id}`, 
              JSON.stringify(simplifiedCourseDetail)
            );
            console.log("Saved default course details to localStorage with multiple tees");
          } catch (e) {
            console.error("Error saving to localStorage:", e);
          }
        }
      } 
      else {
        console.log("Loading course from API:", course);
        
        try {
          const courseIdRaw = course.apiCourseId || course.id;
          // Ensure courseId is a string
          const courseId = typeof courseIdRaw === 'string' ? courseIdRaw : courseIdRaw.toString();
          
          console.log("Fetching API course details for ID:", courseId);
          
          const apiCourseDetail = await getCourseDetails(courseId);
          console.log("API course details (raw):", apiCourseDetail);
          
          setOriginalCourseDetail(apiCourseDetail);
          
          simplifiedCourseDetail = convertToSimplifiedCourseDetail(apiCourseDetail);
          
          if (!simplifiedCourseDetail.name && course.name) {
            console.log("Setting missing course name from search result:", course.name);
            simplifiedCourseDetail.name = course.name;
          }
          if (!simplifiedCourseDetail.clubName && course.clubName) {
            console.log("Setting missing club name from search result:", course.clubName);
            simplifiedCourseDetail.clubName = course.clubName;
          }
          
          simplifiedCourseDetail.apiCourseId = courseId.toString();
          
          // Ensure all tees have proper hole data
          simplifiedCourseDetail.tees.forEach(tee => {
            if (!tee.holes || tee.holes.length === 0) {
              console.log(`API Tee ${tee.name} has no hole data, creating defaults`);
              tee.holes = Array(18).fill(null).map((_, idx) => ({
                number: idx + 1,
                par: 4,
                yards: 400,
                handicap: idx + 1
              }));
            } else if (tee.holes.length < 18) {
              console.log(`API Tee ${tee.name} has incomplete hole data (${tee.holes.length}/18), filling in missing holes`);
              // Add missing holes
              const existingHoleNumbers = tee.holes.map(h => h.number);
              for (let i = 1; i <= 18; i++) {
                if (!existingHoleNumbers.includes(i)) {
                  tee.holes.push({
                    number: i,
                    par: 4,
                    yards: 400,
                    handicap: i
                  });
                }
              }
              // Sort holes by number
              tee.holes.sort((a, b) => a.number - b.number);
            }
            
            // Ensure all holes have par values
            tee.holes.forEach(hole => {
              if (!hole.par) hole.par = 4;
              if (!hole.yards) hole.yards = 400;
              if (!hole.handicap) hole.handicap = hole.number <= 9 ? hole.number : hole.number - 9;
            });
          });
          
          console.log("Final course detail after processing:", simplifiedCourseDetail);
          console.log("Course tees:", simplifiedCourseDetail.tees.map(t => ({ id: t.id, name: t.name })));
        } catch (error) {
          console.error("Error fetching course details from API:", error);
          const defaultHoles = Array(18).fill(null).map((_, idx) => ({
            number: idx + 1,
            par: 4,
            yards: 400,
            handicap: idx + 1
          }));
          
          const defaultTee = {
            id: `tee-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: 'White',
            rating: 72,
            slope: 113,
            par: 72,
            gender: 'male' as const,
            originalIndex: 0,
            holes: defaultHoles
          };
          
          simplifiedCourseDetail = {
            id: course.id,
            name: course.name,
            clubName: course.clubName,
            city: course.city,
            state: course.state,
            tees: [defaultTee],
            holes: defaultHoles,
            apiCourseId: typeof course.apiCourseId === 'string' ? course.apiCourseId : 
                        (course.id !== undefined ? course.id.toString() : "")
          };
          
          throw error;
        }
      }
      
      console.log("Setting selected course:", simplifiedCourseDetail);
      setSelectedCourse(simplifiedCourseDetail);
      
      setSearchResults([]);
      const displayName = course.clubName !== course.name 
        ? `${course.clubName} - ${course.name}`
        : course.name;
      console.log("Setting search query to:", displayName);
      setSearchQuery(displayName);
      
      if (simplifiedCourseDetail.tees && simplifiedCourseDetail.tees.length > 0) {
        const defaultTeeId = simplifiedCourseDetail.tees[0].id;
        console.log("Available tees:", simplifiedCourseDetail.tees.map(t => ({ id: t.id, name: t.name })));
        console.log("Setting default tee ID:", defaultTeeId);
        
        // Set the selected tee ID first
        setSelectedTeeId(defaultTeeId);
        
        console.log("Default tee set to:", {
          id: defaultTeeId,
          name: simplifiedCourseDetail.tees[0]?.name
        });
        
        // Wait for state update before updating scorecard
        setTimeout(() => {
          console.log("Updating scorecard with tee ID:", defaultTeeId);
          updateScorecardForTee(defaultTeeId, 'all');
          setHoleSelection('all');
          
          // Double-check that the course and tee data is available
          console.log("Selected course after update:", simplifiedCourseDetail);
          console.log("Selected tee ID after update:", defaultTeeId);
          console.log("Selected tee name:", simplifiedCourseDetail.tees[0]?.name);
        }, 100); // Increase delay to 100ms to ensure state updates are processed
      } else {
        console.error("No tees found for course:", simplifiedCourseDetail);
        
        // Create a default tee if none exists
        const defaultHoles = Array(18).fill(null).map((_, idx) => ({
          number: idx + 1,
          par: 4,
          yards: 400,
          handicap: idx + 1
        }));
        
        const defaultTeeId = `tee-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const defaultTee = {
          id: defaultTeeId,
          name: 'White',
          rating: 72,
          slope: 113,
          par: 72,
          gender: 'male' as const,
          originalIndex: 0,
          holes: defaultHoles
        };
        
        // Update the course detail with the default tee
        simplifiedCourseDetail.tees = [defaultTee];
        simplifiedCourseDetail.holes = defaultHoles;
        
        // Update state with the modified course detail
        setSelectedCourse(simplifiedCourseDetail);
        setSelectedTeeId(defaultTeeId);
        
        console.log("Created default tee:", defaultTee);
        console.log("Updated course with default tee:", simplifiedCourseDetail);
        
        // Update localStorage if it's a user-added course
        if (simplifiedCourseDetail.isUserAdded) {
          try {
            localStorage.setItem(
              `course_details_${course.id}`, 
              JSON.stringify(simplifiedCourseDetail)
            );
            console.log("Updated course details with default tee in localStorage");
          } catch (e) {
            console.error("Error saving to localStorage:", e);
          }
        }
        
        // Update scorecard with the default tee
        setTimeout(() => {
          updateScorecardForTee(defaultTeeId, 'all');
          setHoleSelection('all');
        }, 50);
      }
      
      setCurrentStep('scorecard');
    } catch (error: any) {
      console.error("Course detail error:", error);
      setSearchError(error.message || "Failed to load course details. Please try again.");
      toast.toast({
        title: "Error",
        description: error.message || "Failed to load course details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenManualCourseForm = () => {
    setManualCourseOpen(true);
  };

  const handleCourseCreated = async (courseId: number, courseName: string) => {
    setManualCourseOpen(false);
    
    try {
      const courseData = await fetchCourseById(courseId);
      
      if (courseData) {
        const { clubName, courseName: name } = courseData;
        
        const newCourse: SimplifiedGolfCourse = {
          id: courseId,
          name,
          clubName,
          city: courseData.city || '',
          state: courseData.state || '',
          country: 'United States',
          isUserAdded: true
        };
        
        await handleCourseSelect(newCourse);
      }
    } catch (error) {
      console.error("Error fetching newly created course:", error);
      toast.toast({
        title: "Error",
        description: "Course was created but could not be loaded automatically. Please search for it.",
        variant: "destructive",
      });
    }
  };

  return {
    handleCourseSelect,
    handleOpenManualCourseForm,
    handleCourseCreated
  };
}
