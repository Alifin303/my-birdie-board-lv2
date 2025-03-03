import { CourseDetail, TeeBox } from "@/services/golfCourseApi";
import { SimplifiedCourseDetail, SimplifiedGolfCourse, SimplifiedHole, SimplifiedTee } from "../types";
import { supabase, formatCourseName, parseCourseName, getCourseMetadataFromLocalStorage, isUserAddedCourse } from "@/integrations/supabase/client";

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

export const loadUserAddedCourseDetails = (courseId: number): SimplifiedCourseDetail | null => {
  try {
    console.log("Loading user-added course details for ID:", courseId);
    
    // First try the direct storage key
    const courseDetailsKey = `course_details_${courseId}`;
    const storedDetails = localStorage.getItem(courseDetailsKey);
    
    if (!storedDetails) {
      console.log("No course details found in localStorage for course ID:", courseId);
      // Try the metadata function as fallback
      const metadata = getCourseMetadataFromLocalStorage(courseId);
      if (metadata && metadata.tees && metadata.tees.length > 0) {
        console.log("Found course metadata using alternate method:", metadata);
        return {
          id: courseId,
          name: metadata.name || "Unknown Course",
          clubName: metadata.clubName || "Unknown Club",
          city: metadata.city || '',
          state: metadata.state || '',
          tees: metadata.tees,
          holes: metadata.holes || metadata.tees[0].holes,
          isUserAdded: true
        };
      }
      return null;
    }
    
    let parsedDetails: any;
    try {
      parsedDetails = JSON.parse(storedDetails);
      console.log("Parsed course details from localStorage:", parsedDetails);
    } catch (error) {
      console.error("Error parsing course details:", error);
      return null;
    }
    
    if (!parsedDetails) {
      console.log("No valid course details found for course ID:", courseId);
      return null;
    }
    
    // Debug the tees structure
    console.log("Tees structure in localStorage:", parsedDetails.tees);
    
    // Ensure the tees array exists and is valid
    if (!parsedDetails.tees || !Array.isArray(parsedDetails.tees) || parsedDetails.tees.length === 0) {
      console.log("No tees array found or empty tees array in course details, creating default tee");
      
      const defaultHoles = Array(18).fill(null).map((_, idx) => ({
        number: idx + 1,
        par: 4,
        yards: 400,
        handicap: idx + 1
      }));
      
      const defaultTeeId = `tee-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      parsedDetails.tees = [{
        id: defaultTeeId,
        name: 'White',
        rating: 72,
        slope: 113,
        par: 72,
        gender: 'male',
        originalIndex: 0,
        holes: defaultHoles
      }];
      
      parsedDetails.holes = defaultHoles;
      
      localStorage.setItem(`course_details_${courseId}`, JSON.stringify(parsedDetails));
      console.log("Updated course details saved to localStorage with default tee");
    } else {
      console.log("Found tees in localStorage:", parsedDetails.tees.map((t: any) => ({ 
        id: t.id, 
        name: t.name,
        par: t.par 
      })));
      
      // Validate each tee has proper holes data
      parsedDetails.tees = parsedDetails.tees.map((tee: any) => {
        if (!tee.holes || !Array.isArray(tee.holes) || tee.holes.length === 0) {
          console.log(`Tee ${tee.name} has no valid holes, creating defaults`);
          tee.holes = Array(18).fill(null).map((_, idx) => ({
            number: idx + 1,
            par: 4,
            yards: 400,
            handicap: idx + 1
          }));
        }
        
        if (tee.holes && tee.holes.length > 0) {
          tee.holes = tee.holes.map((hole: any) => {
            if (!hole.par || hole.par < 2 || hole.par > 6) {
              console.log(`Fixing invalid par value (${hole.par}) for hole ${hole.number} in tee ${tee.name}`);
              return { ...hole, par: 4 };
            }
            return hole;
          });
          
          // Calculate total par from holes
          const calculatedPar = tee.holes.reduce((sum: number, hole: any) => sum + (hole.par || 4), 0);
          
          if (!tee.par || Math.abs(tee.par - calculatedPar) > 5) {
            console.log(`Updating total par for tee ${tee.name} from ${tee.par} to ${calculatedPar}`);
            tee.par = calculatedPar;
          }
          
          console.log(`Tee ${tee.name} has total par ${tee.par} from ${tee.holes.length} holes`);
        } else if (!tee.par) {
          console.log(`Setting default par (72) for tee ${tee.name} as no holes are available`);
          tee.par = 72;
        }
        
        // Ensure all required tee properties exist
        tee.rating = tee.rating || 72.0;
        tee.slope = tee.slope || 113;
        tee.gender = tee.gender || 'male';
        
        return tee;
      });
      
      // Ensure the course has holes array at the top level
      if (!parsedDetails.holes || !Array.isArray(parsedDetails.holes) || parsedDetails.holes.length === 0) {
        if (parsedDetails.tees[0]?.holes && parsedDetails.tees[0].holes.length > 0) {
          console.log("Setting course-level holes from first tee");
          parsedDetails.holes = parsedDetails.tees[0].holes;
        }
      }
      
      // Ensure id, name, and clubName properties exist
      parsedDetails.id = parsedDetails.id || courseId;
      parsedDetails.name = parsedDetails.name || "Unknown Course";
      parsedDetails.clubName = parsedDetails.clubName || parsedDetails.name;
      parsedDetails.isUserAdded = true;
      
      // Save the updated details back to localStorage
      localStorage.setItem(`course_details_${courseId}`, JSON.stringify(parsedDetails));
      console.log("Updated course details with verified par data saved to localStorage");
    }
    
    return {
      id: courseId,
      name: parsedDetails.name || "Unknown Course",
      clubName: parsedDetails.clubName || parsedDetails.name || "Unknown Club",
      city: parsedDetails.city || '',
      state: parsedDetails.state || '',
      tees: parsedDetails.tees || [],
      holes: parsedDetails.holes || (parsedDetails.tees?.[0]?.holes || []),
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
