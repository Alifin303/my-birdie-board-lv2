
import { GolfCourse } from './types';
import { API_CONFIG } from './config';

// Search courses function - updated to match OpenAPI spec
export async function searchCourses(query: string, includeMockData: boolean = false): Promise<{ mockCourses: GolfCourse[], results: GolfCourse[] }> {
  console.log(`Searching for courses with query: ${query}`);
  const normalizedQuery = query.toLowerCase().trim();
  
  let apiResults: GolfCourse[] = [];
  
  try {
    // Build query parameters according to the API spec
    const searchParams = new URLSearchParams({
      search_query: normalizedQuery
    });
    
    // API URL with search endpoint from the OpenAPI spec
    const apiUrl = `${API_CONFIG.API_URL}/search?${searchParams.toString()}`;
    
    console.log(`Making API request to: ${apiUrl}`);
    console.log(`Using authorization header: Key ${API_CONFIG.API_KEY}`);
    
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
    
    console.log(`API response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`API returned error status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`API response data:`, data);
    
    // Process the API response based on its structure from the OpenAPI spec
    // Ensure we always have an array of courses, even if the API returns an empty array or has a different structure
    if (data.courses && Array.isArray(data.courses)) {
      apiResults = data.courses;
    } else if (Array.isArray(data)) {
      apiResults = data;
    } else {
      console.warn('API response format did not match expected structure, using empty array');
      apiResults = [];
    }
    
    console.log(`Found ${apiResults.length} courses from API`);
  } catch (error) {
    // Check if we received a network error
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error(`Network error calling golf course API:`, error);
      
      // Try alternative API URL (old one) as fallback in case new one doesn't work
      try {
        console.log("Trying alternative API URL as fallback...");
        
        const fallbackUrl = "https://golf-courses-api.herokuapp.com/api/v1/courses/search";
        const searchParams = new URLSearchParams({
          q: normalizedQuery,
          limit: '50'
        });
        
        const fallbackApiUrl = `${fallbackUrl}?${searchParams.toString()}`;
        
        console.log(`Making fallback API request to: ${fallbackApiUrl}`);
        
        const fallbackResponse = await fetch(fallbackApiUrl, {
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
        
        if (fallbackData.courses && Array.isArray(fallbackData.courses)) {
          apiResults = fallbackData.courses;
        } else if (fallbackData.data && Array.isArray(fallbackData.data)) {
          apiResults = fallbackData.data;
        } else if (Array.isArray(fallbackData)) {
          apiResults = fallbackData;
        } else {
          console.warn('Fallback API response format did not match expected structure, using empty array');
          apiResults = [];
        }
        
        console.log(`Found ${apiResults.length} courses from fallback API`);
      } catch (fallbackError) {
        console.error(`Error calling fallback golf course API:`, fallbackError);
        // Even if both APIs fail, return an empty array instead of throwing an error
        apiResults = [];
        console.warn("Both primary and fallback APIs failed, returning empty results");
      }
    } else {
      // Add more context to other types of errors
      console.error(`Error calling golf course API:`, error);
      // Return empty array instead of throwing error to avoid breaking the UI
      apiResults = [];
      console.warn("API error occurred, returning empty results");
    }
  }
  
  // Always return a valid structure with empty arrays as fallback
  return { mockCourses: [], results: apiResults };
}
