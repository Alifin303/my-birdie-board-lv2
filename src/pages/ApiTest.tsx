
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { searchCourses, getCourseDetails, GolfCourse, CourseDetail } from "@/services/golfCourseApi";

const ApiTest = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<GolfCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [courseDetails, setCourseDetails] = useState<CourseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [diagnosticInfo, setDiagnosticInfo] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery) return;
    
    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    setCourseDetails(null);
    setRawResponse(null);
    setDiagnosticInfo(null);
    
    try {
      console.log("Testing searchCourses API with query:", searchQuery);
      const courses = await searchCourses(searchQuery);
      console.log("API search response:", courses);
      setSearchResults(courses);
      
      if (courses.length === 0) {
        setError(`No courses found matching "${searchQuery}". Try a different search term.`);
      }
    } catch (err: any) {
      console.error("API search error:", err);
      setError(`Error connecting to Golf Course API: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetDetails = async (courseId: number) => {
    setIsLoading(true);
    setError(null);
    setCourseDetails(null);
    setSelectedCourseId(courseId);
    setRawResponse(null);
    
    try {
      console.log("Testing getCourseDetails API with id:", courseId);
      const details = await getCourseDetails(courseId);
      console.log("API details response:", details);
      setCourseDetails(details);
      
      if (!details) {
        setError("Failed to get course details. Try again or select a different course.");
      }
    } catch (err: any) {
      console.error("API details error:", err);
      setError(`An error occurred while fetching course details: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRawRequest = async () => {
    if (!searchQuery) return;
    
    setIsLoading(true);
    setError(null);
    setRawResponse(null);
    setDiagnosticInfo(null);
    
    try {
      // Start capturing diagnostic info
      let diagInfo = [];
      diagInfo.push(`Testing direct API request to Golf Course API`);
      diagInfo.push(`Search query: "${searchQuery}"`);
      diagInfo.push(`Time: ${new Date().toISOString()}`);
      
      // Direct API call with correct endpoint from API spec
      const searchParams = new URLSearchParams({
        search_query: searchQuery.trim()
      });
      
      const requestUrl = `https://api.golfcourseapi.com/v1/search?${searchParams}`;
      diagInfo.push(`Request URL: ${requestUrl}`);
      
      const headers = {
        'Authorization': 'Key GZQVPVDJB4DPZAQYIR6M64J2NQ',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      diagInfo.push(`Request headers: ${JSON.stringify(headers)}`);
      
      diagInfo.push(`Sending request...`);
      const response = await fetch(
        requestUrl,
        { 
          method: 'GET',
          headers: headers,
          mode: 'cors',
          credentials: 'omit',
          signal: AbortSignal.timeout(10000)
        }
      );
      
      diagInfo.push(`Response received`);
      diagInfo.push(`Status: ${response.status} ${response.statusText}`);
      diagInfo.push(`Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
      
      const responseText = await response.text();
      diagInfo.push(`Response body length: ${responseText.length} bytes`);
      diagInfo.push(`Raw response: ${responseText}`);
      
      setDiagnosticInfo(diagInfo.join('\n'));
      
      try {
        const jsonResponse = JSON.parse(responseText);
        setRawResponse(JSON.stringify(jsonResponse, null, 2));
        
        if (jsonResponse.courses && Array.isArray(jsonResponse.courses)) {
          diagInfo.push(`Found ${jsonResponse.courses.length} courses in response`);
        } else {
          diagInfo.push(`Response doesn't contain an array of courses`);
        }
      } catch (parseError) {
        setRawResponse(responseText);
        diagInfo.push(`Response is not valid JSON: ${parseError.message}`);
      }
      
      setDiagnosticInfo(diagInfo.join('\n'));
      
      if (!response.ok) {
        if (response.status === 404) {
          setError(`No courses found matching "${searchQuery}"`);
        } else if (response.status === 401) {
          setError('Invalid or expired API key. Please check your authorization.');
        } else if (response.status === 429) {
          setError('API rate limit exceeded. Please try again later.');
        } else {
          setError(`API Error: ${response.status} ${response.statusText}`);
        }
      }
    } catch (err: any) {
      console.error("Raw request error:", err);
      setError(`Connection error: ${err.message}`);
      setDiagnosticInfo(`Error during API request: ${err.toString()}\n\nThis may indicate a CORS issue or that the API is unreachable.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Golf Course API Test</h1>
      
      {/* Search Section */}
      <div className="border rounded-lg p-6 mb-8 bg-card">
        <h2 className="text-xl font-semibold mb-4">Test Course Search</h2>
        <div className="flex gap-2 mb-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter course name (e.g., Augusta National)"
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button 
            onClick={handleSearch} 
            disabled={isLoading || !searchQuery}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Search
          </Button>
        </div>
        
        <div className="flex space-x-2 mt-2 mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRawRequest}
            disabled={isLoading || !searchQuery}
          >
            Test Raw API Request
          </Button>
        </div>
        
        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Diagnostic Info */}
        {diagnosticInfo && (
          <div className="mt-4 mb-4">
            <h3 className="text-lg font-medium mb-2">API Diagnostic Information:</h3>
            <div className="bg-muted p-4 rounded-md overflow-x-auto">
              <pre className="text-xs whitespace-pre-wrap">{diagnosticInfo}</pre>
            </div>
          </div>
        )}
        
        {/* Raw Response Display */}
        {rawResponse && (
          <div className="mt-4 mb-4">
            <h3 className="text-lg font-medium mb-2">Raw API Response:</h3>
            <div className="bg-muted p-4 rounded-md overflow-x-auto">
              <pre className="text-xs whitespace-pre-wrap">{rawResponse}</pre>
            </div>
          </div>
        )}
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Search Results:</h3>
            <div className="border rounded-md divide-y">
              {searchResults.map((course) => (
                <div 
                  key={course.id} 
                  className={`p-4 hover:bg-muted cursor-pointer ${selectedCourseId === Number(course.id) ? 'bg-muted' : ''}`}
                  onClick={() => handleGetDetails(Number(course.id))}
                >
                  <p className="font-medium">{course.course_name}</p>
                  <p className="text-sm">{course.club_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {course.location.city}{course.location.state ? `, ${course.location.state}` : ''}
                    {course.location.country && course.location.country !== 'United States' ? `, ${course.location.country}` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">ID: {course.id}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Course Details Section */}
      {courseDetails && (
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Course Details</h2>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-1">{courseDetails.course_name}</h3>
            <p className="text-md mb-1">{courseDetails.club_name}</p>
            <p className="text-muted-foreground mb-4">
              {courseDetails.location.city}{courseDetails.location.state ? `, ${courseDetails.location.state}` : ''}
              {courseDetails.location.country && courseDetails.location.country !== 'United States' ? `, ${courseDetails.location.country}` : ''}
            </p>
            
            {/* Male Tees */}
            {courseDetails.tees.male && courseDetails.tees.male.length > 0 && (
              <>
                <h4 className="font-medium mb-2">Men's Tees:</h4>
                <div className="grid gap-2 mb-6">
                  {courseDetails.tees.male.map((tee, index) => (
                    <div key={index} className="p-3 border rounded-md bg-background">
                      <p className="font-medium">{tee.tee_name}</p>
                      <p className="text-sm">Rating: {tee.course_rating}, Slope: {tee.slope_rating}, Par: {tee.par_total}</p>
                      <p className="text-sm">Total Yards: {tee.total_yards}</p>
                      
                      {/* Holes for this tee */}
                      {tee.holes && tee.holes.length > 0 && (
                        <div className="mt-2 overflow-x-auto">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-1 px-2">Hole</th>
                                <th className="text-left py-1 px-2">Par</th>
                                <th className="text-left py-1 px-2">Yards</th>
                                <th className="text-left py-1 px-2">Handicap</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {tee.holes.map((hole, holeIndex) => (
                                <tr key={holeIndex} className="hover:bg-muted/30">
                                  <td className="py-1 px-2">{holeIndex + 1}</td>
                                  <td className="py-1 px-2">{hole.par}</td>
                                  <td className="py-1 px-2">{hole.yardage}</td>
                                  <td className="py-1 px-2">{hole.handicap}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {/* Female Tees */}
            {courseDetails.tees.female && courseDetails.tees.female.length > 0 && (
              <>
                <h4 className="font-medium mb-2">Women's Tees:</h4>
                <div className="grid gap-2 mb-6">
                  {courseDetails.tees.female.map((tee, index) => (
                    <div key={index} className="p-3 border rounded-md bg-background">
                      <p className="font-medium">{tee.tee_name}</p>
                      <p className="text-sm">Rating: {tee.course_rating}, Slope: {tee.slope_rating}, Par: {tee.par_total}</p>
                      <p className="text-sm">Total Yards: {tee.total_yards}</p>
                      
                      {/* Holes for this tee */}
                      {tee.holes && tee.holes.length > 0 && (
                        <div className="mt-2 overflow-x-auto">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-1 px-2">Hole</th>
                                <th className="text-left py-1 px-2">Par</th>
                                <th className="text-left py-1 px-2">Yards</th>
                                <th className="text-left py-1 px-2">Handicap</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {tee.holes.map((hole, holeIndex) => (
                                <tr key={holeIndex} className="hover:bg-muted/30">
                                  <td className="py-1 px-2">{holeIndex + 1}</td>
                                  <td className="py-1 px-2">{hole.par}</td>
                                  <td className="py-1 px-2">{hole.yardage}</td>
                                  <td className="py-1 px-2">{hole.handicap}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      <div className="mt-6 p-4 border rounded-md bg-muted/30">
        <h3 className="font-medium mb-2">API Integration Notes:</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Make sure your network connection allows outbound requests to golfcourseapi.com</li>
          <li>The API requires the Authorization header with the correct API key</li>
          <li>Search parameter is 'search_query' according to the API specification</li>
          <li>If you're still having issues, try testing with common golf course names like "Augusta National" or "Pebble Beach"</li>
          <li>For persistent issues, contact GolfCourseAPI support with the error details shown above</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiTest;
