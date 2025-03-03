import { CourseDetail, TeeBox } from "@/services/golfCourseApi";
import { SimplifiedCourseDetail, SimplifiedGolfCourse, SimplifiedHole, SimplifiedTee } from "../types";
import { supabase, formatCourseName, parseCourseName, isUserAddedCourse } from "@/integrations/supabase";
import { getCourseMetadataFromLocalStorage } from "@/integrations/supabase";

export const extractHolesForTee = (courseDetail: CourseDetail, teeId: string): SimplifiedHole[] => {
  console.log("Extracting holes for tee:", teeId, "from course detail:", courseDetail);
  
  if (!courseDetail) {
    console.error("No course detail provided");
    return Array(18).fill(null).map((_, idx) => ({
      number: idx + 1,
      par: 4,
      yards: 400,
      handicap: idx + 1
    }));
  }
  
  const [gender, indexStr] = teeId.split('-');
  const index = parseInt(indexStr);
  
  let teeData: TeeBox | undefined;
  let holesData: Array<{number?: number, par?: number, yardage?: number, handicap?: number}> = [];
  
  if (courseDetail.tees) {
    if (gender === 'm' && courseDetail.tees.male && courseDetail.tees.male.length > index) {
      teeData = courseDetail.tees.male[index];
      if (teeData && teeData.holes && teeData.holes.length > 0) {
        holesData = teeData.holes;
      }
    } else if (gender === 'f' && courseDetail.tees.female && courseDetail.tees.female.length > index) {
      teeData = courseDetail.tees.female[index];
      if (teeData && teeData.holes && teeData.holes.length > 0) {
        holesData = teeData.holes;
      }
    }
  }

  console.log("Extracted tee data:", teeData);
  console.log("Extracted holes data for tee:", teeId, holesData);
  
  if (holesData && holesData.length > 0) {
    const mappedHoles = holesData.map((hole, idx) => ({
      number: hole.number || idx + 1,
      par: hole.par || 4,
      yards: hole.yardage || 400,
      handicap: hole.handicap || idx + 1
    }));
    
    console.log("Mapped holes for selected tee:", mappedHoles);
    return mappedHoles;
  }
  
  if (courseDetail.tees) {
    console.log("Looking for hole data in any tee");
    
    const genderTees = gender === 'm' ? courseDetail.tees.male : courseDetail.tees.female;
    if (genderTees) {
      for (const tee of genderTees) {
        if (tee.holes && tee.holes.length > 0) {
          console.log(`Found hole data in ${gender === 'm' ? 'male' : 'female'} tee:`, tee.tee_name);
          const mappedHoles = tee.holes.map((hole, idx) => ({
            number: hole.number || idx + 1,
            par: hole.par || 4,
            yards: hole.yardage || 400,
            handicap: hole.handicap || idx + 1
          }));
          
          console.log(`Mapped holes from alternative ${gender === 'm' ? 'male' : 'female'} tee:`, mappedHoles);
          return mappedHoles;
        }
      }
    }
    
    const otherGenderTees = gender === 'm' ? courseDetail.tees.female : courseDetail.tees.male;
    if (otherGenderTees) {
      for (const tee of otherGenderTees) {
        if (tee.holes && tee.holes.length > 0) {
          console.log(`Found hole data in ${gender === 'm' ? 'female' : 'male'} tee:`, tee.tee_name);
          const mappedHoles = tee.holes.map((hole, idx) => ({
            number: hole.number || idx + 1,
            par: hole.par || 4,
            yards: hole.yardage || 400,
            handicap: hole.handicap || idx + 1
          }));
          
          console.log(`Mapped holes from alternative ${gender === 'm' ? 'female' : 'male'} tee:`, mappedHoles);
          return mappedHoles;
        }
      }
    }
  }
  
  console.log("No hole data found, creating default holes");
  const defaultHoles = Array(18).fill(null).map((_, idx) => ({
    number: idx + 1,
    par: 4,
    yards: 400,
    handicap: idx + 1
  }));
  
  console.log("Created default holes:", defaultHoles);
  return defaultHoles;
};

export const convertToSimplifiedCourseDetail = (courseDetail: CourseDetail): SimplifiedCourseDetail => {
  console.log("Converting course detail to simplified format:", courseDetail);
  
  const name = courseDetail.course_name || "Unknown Course";
  const clubName = courseDetail.club_name || "Unknown Club";
  
  console.log("Course name:", name);
  console.log("Club name:", clubName);
  
  const tees = extractTeesFromApiResponse(courseDetail);
  console.log("Extracted tees:", tees.map(t => ({ id: t.id, name: t.name, par: t.par })));
  
  const simplifiedTees = tees.map(tee => {
    const teeHoles = extractHolesForTee(courseDetail, tee.id);
    return { ...tee, holes: teeHoles };
  });
  
  let holes: SimplifiedHole[] = [];
  if (simplifiedTees.length > 0) {
    const firstTee = simplifiedTees[0];
    holes = firstTee.holes || [];
    
    if (!holes || holes.length === 0) {
      holes = Array(18).fill(null).map((_, idx) => ({
        number: idx + 1,
        par: 4,
        yards: 400,
        handicap: idx + 1
      }));
    }
  } else {
    console.log("No tees available, creating default holes");
    holes = Array(18).fill(null).map((_, idx) => ({
      number: idx + 1,
      par: 4,
      yards: 400,
      handicap: idx + 1
    }));
  }
  
  const courseId = typeof courseDetail.id === 'string' ? parseInt(courseDetail.id, 10) : 
                   typeof courseDetail.id === 'number' ? courseDetail.id : 0;

  const simplified: SimplifiedCourseDetail = {
    id: courseId,
    name,
    clubName,
    city: courseDetail.location?.city || '',
    state: courseDetail.location?.state || '',
    country: courseDetail.location?.country || 'United States',
    tees: simplifiedTees,
    holes,
    apiCourseId: courseDetail.id ? courseDetail.id.toString() : ''
  };
  
  console.log("Simplified course detail:", simplified);
  console.log("Simplified tees:", simplified.tees.map(t => ({ id: t.id, name: t.name, par: t.par })));
  return simplified;
};

export const extractTeesFromApiResponse = (courseDetail: CourseDetail): SimplifiedTee[] => {
  const tees: SimplifiedTee[] = [];
  console.log("Extracting tees from API response:", courseDetail);
  
  if (courseDetail.tees) {
    if (courseDetail.tees.male && courseDetail.tees.male.length > 0) {
      courseDetail.tees.male.forEach((tee, index) => {
        console.log(`Male tee ${index}:`, tee);
        // Calculate total par if not available
        let teePar = tee.par_total;
        if (!teePar && tee.holes && tee.holes.length > 0) {
          teePar = tee.holes.reduce((sum, hole) => sum + (hole.par || 4), 0);
        }
        
        tees.push({
          id: `m-${index}`,
          name: tee.tee_name || 'Unknown Tee',
          rating: tee.course_rating ?? 72,
          slope: tee.slope_rating ?? 113,
          par: teePar ?? 72,
          gender: 'male',
          originalIndex: index,
          yards: tee.total_yards
        });
      });
    }
    
    if (courseDetail.tees.female && courseDetail.tees.female.length > 0) {
      courseDetail.tees.female.forEach((tee, index) => {
        console.log(`Female tee ${index}:`, tee);
        // Calculate total par if not available
        let teePar = tee.par_total;
        if (!teePar && tee.holes && tee.holes.length > 0) {
          teePar = tee.holes.reduce((sum, hole) => sum + (hole.par || 4), 0);
        }
        
        tees.push({
          id: `f-${index}`,
          name: tee.tee_name || 'Unknown Tee',
          rating: tee.course_rating ?? 72,
          slope: tee.slope_rating ?? 113,
          par: teePar ?? 72,
          gender: 'female',
          originalIndex: index,
          yards: tee.total_yards
        });
      });
    }
  }
  
  console.log("Extracted tees:", tees.map(t => ({ id: t.id, name: t.name, par: t.par })));
  return tees;
};

export const loadUserAddedCourseDetails = async (courseId: number | string): Promise<SimplifiedCourseDetail | null> => {
  try {
    console.log(`Loading user-added course details for ID: ${courseId}`);
    
    // Get course metadata from localStorage
    const parsedDetails = getCourseMetadataFromLocalStorage(courseId);
    
    if (!parsedDetails) {
      console.error(`No course details found in localStorage for course ID: ${courseId}`);
      return null;
    }
    
    console.log("Found course details in localStorage:", parsedDetails);
    
    // Validate and ensure tees exist and are properly formatted
    if (!parsedDetails.tees || !Array.isArray(parsedDetails.tees) || parsedDetails.tees.length === 0) {
      console.warn("Course has no tees or improperly formatted tees data. Creating default tee.");
      
      // Create a default tee if none exists
      const defaultTeeId = `tee-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const defaultHoles = Array(18).fill(null).map((_, idx) => ({
        number: idx + 1,
        par: 4,
        yards: 400,
        handicap: idx + 1
      }));
      
      parsedDetails.tees = [{
        id: defaultTeeId,
        name: 'White',
        rating: 72,
        slope: 113,
        par: 72,
        gender: 'male',
        holes: defaultHoles
      }];
      
      // Make sure holes exist at the root level too
      parsedDetails.holes = defaultHoles;
      
      // Save the updated details
      localStorage.setItem(`course_details_${courseId}`, JSON.stringify(parsedDetails));
      console.log("Created and saved default tee for course due to missing tees data");
    } else {
      // Validate existing tees
      let teesUpdated = false;
      
      parsedDetails.tees = parsedDetails.tees.map(tee => {
        // Skip any undefined tees
        if (!tee) return null;
        
        console.log(`Validating tee: ${tee.name} (ID: ${tee.id || 'missing ID'})`);
        
        // Ensure each tee has the required properties
        if (!tee.id) {
          tee.id = `tee-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          teesUpdated = true;
          console.log(`Added missing ID to tee: ${tee.name}, new ID: ${tee.id}`);
        }
        
        // Ensure each tee has a valid name
        if (!tee.name) {
          tee.name = 'Default';
          teesUpdated = true;
          console.log(`Added missing name to tee ID: ${tee.id}`);
        }
        
        // Ensure each tee has rating and slope
        tee.rating = tee.rating || 72.0;
        tee.slope = tee.slope || 113;
        
        // Ensure holes exist for this tee
        if (!tee.holes || !Array.isArray(tee.holes) || tee.holes.length === 0) {
          console.warn(`Tee ${tee.name} has no hole data. Creating default holes.`);
          tee.holes = Array(18).fill(null).map((_, idx) => ({
            number: idx + 1,
            par: 4,
            yards: 400,
            handicap: idx + 1
          }));
          teesUpdated = true;
        }
        
        // Verify holes data is complete
        if (tee.holes) {
          tee.holes = tee.holes.map((hole, idx) => {
            if (!hole) {
              return {
                number: idx + 1,
                par: 4,
                yards: 400,
                handicap: idx + 1
              };
            }
            
            // Ensure each hole has required properties
            hole.number = hole.number || (idx + 1);
            hole.par = hole.par || 4;
            hole.yards = hole.yards || 400;
            hole.handicap = hole.handicap || (idx + 1);
            
            return hole;
          });
        }
        
        // Calculate total par from hole data
        const calculatedPar = tee.holes.reduce((sum, hole) => sum + (hole.par || 4), 0);
        if (!tee.par || tee.par !== calculatedPar) {
          console.log(`Updating par for tee ${tee.name} from ${tee.par} to calculated ${calculatedPar}`);
          tee.par = calculatedPar;
          teesUpdated = true;
        }
        
        return tee;
      }).filter(Boolean); // Remove any null tees
      
      if (teesUpdated) {
        // Save the updated details
        localStorage.setItem(`course_details_${courseId}`, JSON.stringify(parsedDetails));
        console.log("Updated course details with verified tee data saved to localStorage");
      }
    }
    
    // Ensure id, name, and clubName properties exist
    parsedDetails.id = parsedDetails.id || courseId;
    parsedDetails.name = parsedDetails.name || "Unknown Course";
    parsedDetails.clubName = parsedDetails.clubName || parsedDetails.name;
    parsedDetails.isUserAdded = true;
    
    // Ensure holes exist at the root level
    if (!parsedDetails.holes || !Array.isArray(parsedDetails.holes) || parsedDetails.holes.length === 0) {
      if (parsedDetails.tees && parsedDetails.tees.length > 0 && parsedDetails.tees[0].holes) {
        parsedDetails.holes = parsedDetails.tees[0].holes;
      } else {
        parsedDetails.holes = Array(18).fill(null).map((_, idx) => ({
          number: idx + 1,
          par: 4,
          yards: 400,
          handicap: idx + 1
        }));
      }
    }
    
    // Create the properly structured SimplifiedCourseDetail object
    console.log("Returning verified course data with tees:", parsedDetails.tees.map(t => ({ id: t.id, name: t.name, par: t.par })));
    
    return {
      id: parsedDetails.id.toString(),
      name: parsedDetails.name,
      clubName: parsedDetails.clubName,
      city: parsedDetails.city || '',
      state: parsedDetails.state || '',
      tees: parsedDetails.tees.map(tee => ({
        id: tee.id,
        name: tee.name,
        par: tee.par,
        rating: tee.rating,
        slope: tee.slope,
        gender: tee.gender || 'male',
        holes: tee.holes.map(hole => ({
          number: hole.number,
          par: hole.par,
          yards: hole.yards,
          handicap: hole.handicap
        }))
      })),
      holes: parsedDetails.holes.map(hole => ({
        number: hole.number,
        par: hole.par,
        yards: hole.yards,
        handicap: hole.handicap
      })),
      isUserAdded: true
    };
  } catch (error) {
    console.error("Error loading course details from localStorage:", error);
    return null;
  }
};

export const fetchUserAddedCourses = async (query: string): Promise<SimplifiedGolfCourse[]> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .ilike('name', `%${query}%`);
      
    if (error) {
      console.error("Error fetching user-added courses:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.map(course => {
      const { clubName, courseName } = parseCourseName(course.name);
      return {
        id: course.id,
        name: courseName,
        clubName: clubName,
        city: course.city || '',
        state: course.state || '',
        country: 'United States',
        isUserAdded: isUserAddedCourse(course.name),
        apiCourseId: course.api_course_id
      };
    });
  } catch (error) {
    console.error("Error fetching user-added courses:", error);
    return [];
  }
};

export const enhanceCourseResults = (courses: SimplifiedGolfCourse[]): SimplifiedGolfCourse[] => {
  return courses.map(course => {
    const metadata = getCourseMetadataFromLocalStorage(course.id);
    return {
      ...course,
      city: course.city || metadata?.city || '',
      state: course.state || metadata?.state || '',
      isUserAdded: course.isUserAdded || isUserAddedCourse(course.name)
    };
  });
};
