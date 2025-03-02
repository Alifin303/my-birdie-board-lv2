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

  console.log("Extracted holes data for tee:", teeId, holesData);
  
  if (holesData && holesData.length > 0) {
    const mappedHoles = holesData.map((hole, idx) => ({
      number: hole.number || idx + 1,
      par: hole.par || 4,
      yards: hole.yardage,
      handicap: hole.handicap
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
            yards: hole.yardage,
            handicap: hole.handicap
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
            yards: hole.yardage,
            handicap: hole.handicap
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
  return simplified;
};

export const extractTeesFromApiResponse = (courseDetail: CourseDetail): SimplifiedTee[] => {
  const tees: SimplifiedTee[] = [];
  
  if (courseDetail.tees) {
    if (courseDetail.tees.male && courseDetail.tees.male.length > 0) {
      courseDetail.tees.male.forEach((tee, index) => {
        tees.push({
          id: `m-${index}`,
          name: tee.tee_name || 'Unknown Tee',
          rating: tee.course_rating ?? 72,
          slope: tee.slope_rating ?? 113,
          par: tee.par_total ?? 72,
          gender: 'male',
          originalIndex: index,
          yards: tee.total_yards
        });
      });
    }
    
    if (courseDetail.tees.female && courseDetail.tees.female.length > 0) {
      courseDetail.tees.female.forEach((tee, index) => {
        tees.push({
          id: `f-${index}`,
          name: tee.tee_name || 'Unknown Tee',
          rating: tee.course_rating ?? 72,
          slope: tee.slope_rating ?? 113,
          par: tee.par_total ?? 72,
          gender: 'female',
          originalIndex: index,
          yards: tee.total_yards
        });
      });
    }
  }
  
  return tees;
};

export const loadUserAddedCourseDetails = (courseId: number): SimplifiedCourseDetail | null => {
  try {
    const storedDetails = localStorage.getItem(`course_details_${courseId}`);
    if (!storedDetails) {
      console.log("No course details found in localStorage for course ID:", courseId);
      return null;
    }
    
    const parsedDetails = JSON.parse(storedDetails);
    console.log("Parsed course details from localStorage:", parsedDetails);
    
    if (!parsedDetails.tees || parsedDetails.tees.length === 0) {
      console.log("No tees found in course details, creating default tee");
      
      const defaultHoles = Array(18).fill(null).map((_, idx) => ({
        number: idx + 1,
        par: 4,
        yards: 400,
        handicap: idx + 1
      }));
      
      parsedDetails.tees = [{
        id: `tee-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
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
    }
    
    return parsedDetails as SimplifiedCourseDetail;
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

export const transformCourseDetails = (
  courseId: number | string, 
  courseDetail: any, 
  simplifiedCourse: SimplifiedGolfCourse
): SimplifiedCourseDetail => {
  const id = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
  
  const transformedCourse: SimplifiedCourseDetail = {
    id: id,
    name: simplifiedCourse.name || courseDetail.course_name || 'Unknown Course',
    clubName: simplifiedCourse.clubName || courseDetail.club_name || 'Unknown Club',
    city: simplifiedCourse.city || courseDetail?.location?.city || '',
    state: simplifiedCourse.state || courseDetail?.location?.state || '',
    country: simplifiedCourse.country || courseDetail?.location?.country || 'United States',
    tees: [],
    holes: [],
    isUserAdded: simplifiedCourse.isUserAdded || false,
    apiCourseId: courseId.toString(),
  };
  
  transformedCourse.tees = extractTeesFromApiResponse(courseDetail);
  
  if (transformedCourse.tees.length > 0) {
    const firstTeeId = transformedCourse.tees[0].id;
    transformedCourse.holes = extractHolesForTee(courseDetail, firstTeeId);
  } else {
    transformedCourse.holes = Array(18).fill(null).map((_, idx) => ({
      number: idx + 1,
      par: 4,
      yards: 400,
      handicap: idx + 1
    }));
  }
  
  return transformedCourse;
};
