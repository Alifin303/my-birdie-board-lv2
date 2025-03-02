
import { CourseDetail } from './types';
import { API_CONFIG } from './config';
import { processTees } from './utils';

// Get course details function - updated to match OpenAPI spec
export async function getCourseDetails(courseId: number | string): Promise<CourseDetail> {
  console.log(`Fetching details for course ID: ${courseId}`);
  
  try {
    // API URL with course ID endpoint from the OpenAPI spec
    const apiUrl = `${API_CONFIG.API_URL}/courses/${courseId}`;
    
    console.log(`Making API request to: ${apiUrl}`);
    
    // Make the API request with the proper Authorization header format
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${API_CONFIG.API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors',
      signal: AbortSignal.timeout(15000) // 15 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`API returned error status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`API course details data:`, data);
    
    // Check if we need to try a fallback API
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      throw new Error('Empty response from API');
    }
    
    // The API should return a Course object directly according to the spec
    let courseDetail: CourseDetail = data;
    
    // If the API returns a nested structure, handle it
    if (data.course) {
      courseDetail = data.course;
    } else if (data.data) {
      courseDetail = data.data;
    }
    
    // Make sure the response has the expected properties
    // If any required properties are missing, map them from what's available
    courseDetail = {
      id: courseDetail.id || courseId,
      club_name: courseDetail.club_name || (courseDetail as any).clubName || (courseDetail as any).name,
      course_name: courseDetail.course_name || (courseDetail as any).courseName,
      description: courseDetail.description,
      website: courseDetail.website,
      location: courseDetail.location || {
        city: (courseDetail as any).city,
        state: (courseDetail as any).state,
        country: (courseDetail as any).country || 'USA',
        address: (courseDetail as any).address
      },
      holes: courseDetail.holes || 18,
      tees: courseDetail.tees || processTees(courseDetail),
      features: courseDetail.features || [],
      price_range: courseDetail.price_range || (courseDetail as any).priceRange || '$$$'
    };
    
    return courseDetail;
  } catch (error) {
    // Check if we received a network error
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error(`Network error fetching course details:`, error);
      
      // Try alternative API URL (old one) as fallback
      try {
        console.log("Trying alternative API URL for course details as fallback...");
        
        const fallbackUrl = `https://golf-courses-api.herokuapp.com/api/v1/courses/${courseId}`;
        
        console.log(`Making fallback API request to: ${fallbackUrl}`);
        
        const fallbackResponse = await fetch(fallbackUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Key ${API_CONFIG.API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors',
          signal: AbortSignal.timeout(15000)
        });
        
        if (!fallbackResponse.ok) {
          throw new Error(`Fallback API returned error status: ${fallbackResponse.status}`);
        }
        
        const fallbackData = await fallbackResponse.json();
        
        let courseDetail: CourseDetail;
        
        if (fallbackData.course) {
          courseDetail = fallbackData.course;
        } else if (fallbackData.data) {
          courseDetail = fallbackData.data;
        } else {
          courseDetail = fallbackData;
        }
        
        // Map the response
        courseDetail = {
          id: courseDetail.id || courseId,
          club_name: courseDetail.club_name || (courseDetail as any).clubName || (courseDetail as any).name,
          course_name: courseDetail.course_name || (courseDetail as any).courseName,
          description: courseDetail.description,
          website: courseDetail.website,
          location: courseDetail.location || {
            city: (courseDetail as any).city,
            state: (courseDetail as any).state,
            country: (courseDetail as any).country || 'USA',
            address: (courseDetail as any).address
          },
          holes: courseDetail.holes || 18,
          tees: courseDetail.tees || processTees(courseDetail),
          features: courseDetail.features || [],
          price_range: courseDetail.price_range || (courseDetail as any).priceRange || '$$$'
        };
        
        return courseDetail;
      } catch (fallbackError) {
        console.error(`Error calling fallback course details API:`, fallbackError);
        throw new Error(`Failed to get course details: Network error. The Golf Course API servers might be down or unreachable.`);
      }
    } else {
      console.error(`Error fetching course details from API:`, error);
      const enhancedError = new Error(`Failed to get course details: ${(error as Error).message}. Please check your network connection and ensure the API is available.`);
      (enhancedError as any).originalError = error;
      throw enhancedError;
    }
  }
}
