
import { API_CONFIG } from './config';

// Check API health status
export async function checkApiHealth(): Promise<{status: string, available: boolean}> {
  try {
    // API URL with healthcheck endpoint from the OpenAPI spec
    const apiUrl = `${API_CONFIG.API_URL}/healthcheck`;
    
    console.log(`Checking API health at: ${apiUrl}`);
    
    // Make the API request with the proper Authorization header format
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${API_CONFIG.API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (!response.ok) {
      return { status: `Error: ${response.status}`, available: false };
    }
    
    const data = await response.json();
    
    return { 
      status: data.status || 'unknown', 
      available: data.status === 'available'
    };
  } catch (error) {
    console.error(`Error checking API health:`, error);
    
    // Try alternative API URL as fallback
    try {
      const fallbackUrl = "https://golf-courses-api.herokuapp.com/api/v1/status";
      
      console.log(`Checking fallback API health at: ${fallbackUrl}`);
      
      const fallbackResponse = await fetch(fallbackUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Key ${API_CONFIG.API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        signal: AbortSignal.timeout(5000)
      });
      
      if (!fallbackResponse.ok) {
        return { status: `Fallback Error: ${fallbackResponse.status}`, available: false };
      }
      
      const fallbackData = await fallbackResponse.json();
      
      return { 
        status: fallbackData.status || 'unknown (fallback API)', 
        available: true
      };
    } catch (fallbackError) {
      console.error(`Error checking fallback API health:`, fallbackError);
      return { 
        status: `Network Error: ${(error as Error).message}`, 
        available: false 
      };
    }
  }
}
