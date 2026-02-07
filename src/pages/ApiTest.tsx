
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { searchCourses, getCourseDetails, checkApiHealth, GolfCourse, CourseDetail, API_CONFIG } from "@/services/golfCourseApi";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const ApiTest = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<GolfCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [courseDetails, setCourseDetails] = useState<CourseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [diagnosticInfo, setDiagnosticInfo] = useState<string | null>(null);
  const [location, setLocation] = useState<string>("");
  const [apiStatus, setApiStatus] = useState<'checking' | 'success' | 'error' | 'idle'>('idle');

  // Predefined locations for quick searching
  const popularLocations = [
    { label: "Dallas, TX", value: "dallas" },
    { label: "Orlando, FL", value: "orlando" },
    { label: "Pebble Beach, CA", value: "pebble beach" },
    { label: "Augusta, GA", value: "augusta" },
    { label: "St Andrews, Scotland", value: "st andrews" },
    { label: "Rayleigh, UK", value: "rayleigh" },
    { label: "New York, NY", value: "new york" },
    { label: "Liverpool, UK", value: "liverpool" },
    { label: "London, UK", value: "london" },
    { label: "Las Vegas, NV", value: "las vegas" }
  ];

  // Check API status on component mount
  useEffect(() => {
    checkApiStatus();
  }, []);

  // Function to check if the API is available
  const checkApiStatus = async () => {
    setApiStatus('checking');
    try {
      const healthStatus = await checkApiHealth();
      
      if (healthStatus.available) {
        setApiStatus('success');
        setDiagnosticInfo(`API Status Check: Success (${new Date().toISOString()})
API is responding properly with status: ${healthStatus.status}`);
      } else {
        setApiStatus('error');
        setDiagnosticInfo(`API Status Check: Error (${new Date().toISOString()})
API returned status: ${healthStatus.status}`);
      }
    } catch (err) {
      setApiStatus('error');
      setDiagnosticInfo(`API Status Check: Error (${new Date().toISOString()})
${err instanceof Error ? err.message : 'Unknown error occurred'}.
This may be due to CORS restrictions, API unavailability, or network issues.`);
    }
  };

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
      
      const { results } = await searchCourses(searchQuery);
      
      console.log("API search response:", results);
      
      // Store raw response for debugging
      setRawResponse(JSON.stringify(results, null, 2));
      
      setSearchResults(results);
      
      // Add diagnostic info about the search
      const diagInfo = [
        `Search query: "${searchQuery}"`,
        `Search performed: ${new Date().toISOString()}`,
        `Endpoint: Edge Function (golf-course-api)`,
        `Matching courses found: ${results.length}`,
      ];
      
      if (results.length > 0) {
        diagInfo.push(`\nMatching courses:`);
        results.forEach((course, idx) => {
          diagInfo.push(`${idx + 1}. ${course.club_name} - ${course.course_name} (ID: ${course.id}, Location: ${course.location?.city}, ${course.location?.state})`);
        });
      }
      
      setDiagnosticInfo(diagInfo.join('\n'));
      
      if (results.length === 0) {
        setError(`No courses found matching "${searchQuery}". Try a different search term.`);
      }
    } catch (err: any) {
      console.error("API search error:", err);
      
      // Enhanced error message with more context
      let errorMessage = `Error connecting to Golf Course API: ${err.message}`;
      
      // Add suggestions based on error
      if (err.message.includes('Failed to fetch') || err.message.includes('Network')) {
        errorMessage += `\n\nPossible causes:
- The API server may be down or unreachable
- Network connectivity issues
- CORS policy restrictions
- API endpoint has changed or is unavailable`;
      }
      
      setError(errorMessage);
      
      // Add diagnostic info about the failed request
      setDiagnosticInfo(`Failed API request details:
- Time: ${new Date().toISOString()}
- Search query: "${searchQuery}"
- Endpoint: Edge Function (golf-course-api)
- Error: ${err.message}`);
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
      
      // Store raw response for debugging
      setRawResponse(JSON.stringify(details, null, 2));
      
      setCourseDetails(details);
      
      // Add diagnostic info
      setDiagnosticInfo(`Course details fetch:
- Time: ${new Date().toISOString()}
- Course ID: ${courseId}
- Endpoint: Edge Function (golf-course-api)
- Response received successfully`);
      
      if (!details) {
        setError("Failed to get course details. Try again or select a different course.");
      }
    } catch (err: any) {
      console.error("API details error:", err);
      
      // Enhanced error message with more context
      let errorMessage = `An error occurred while fetching course details: ${err.message}`;
      
      // Add suggestions based on error
      if (err.message.includes('Failed to fetch') || err.message.includes('Network')) {
        errorMessage += `\n\nPossible causes:
- The API server may be down or unreachable
- Network connectivity issues
- CORS policy restrictions
- API endpoint has changed or is unavailable`;
      }
      
      setError(errorMessage);
      
      // Add diagnostic info about the failed request
      setDiagnosticInfo(`Failed course details request:
- Time: ${new Date().toISOString()}
- Course ID: ${courseId}
- Endpoint: Edge Function (golf-course-api)
- Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (locationValue: string) => {
    setSearchQuery(locationValue);
    setLocation("");  // Reset the dropdown after selection
    handleSearch();  // Automatically trigger search
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Golf Course API Test</h1>
      
      {/* API Status Indicator */}
      <div className="mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                apiStatus === 'checking' ? 'bg-yellow-500 animate-pulse' : 
                apiStatus === 'success' ? 'bg-green-500' : 
                apiStatus === 'error' ? 'bg-red-500' : 'bg-gray-300'
              }`}></div>
              API Status: {
                apiStatus === 'checking' ? 'Checking...' : 
                apiStatus === 'success' ? 'Available' : 
                apiStatus === 'error' ? 'Connection Issues' : 'Unknown'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              <p>Endpoint: Edge Function Proxy (golf-course-api)</p>
              <p>API Key: Stored securely as server-side secret</p>
            </div>
            <Button 
              onClick={checkApiStatus} 
              variant="outline" 
              disabled={apiStatus === 'checking'}
              className="w-full sm:w-auto"
            >
              {apiStatus === 'checking' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Check API Connection
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Search Section */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle>Test Course Search</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search Input */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter course name or location (e.g., Dallas, Augusta)"
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              onClick={handleSearch} 
              disabled={isLoading || !searchQuery}
              className="w-full sm:w-auto"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Search
            </Button>
          </div>
          
          {/* Quick Location Selector */}
          <div className="mb-4">
            <Select value={location} onValueChange={handleLocationSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Search popular locations..." />
              </SelectTrigger>
              <SelectContent>
                {popularLocations.map((loc) => (
                  <SelectItem key={loc.value} value={loc.value}>
                    {loc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Select a popular location to quickly search for courses
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Diagnostic Info */}
      {diagnosticInfo && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">API Diagnostic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md overflow-x-auto">
              <pre className="text-xs whitespace-pre-wrap">{diagnosticInfo}</pre>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md divide-y">
              {searchResults.map((course) => (
                <div 
                  key={`${course.id}`} 
                  className={`p-4 hover:bg-muted cursor-pointer ${selectedCourseId === Number(course.id) ? 'bg-muted' : ''}`}
                  onClick={() => handleGetDetails(Number(course.id))}
                >
                  <p className="font-medium">{course.club_name}</p>
                  <p className="text-sm">{course.course_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {course.location?.city}{course.location?.state ? `, ${course.location?.state}` : ''}
                    {course.location?.country && course.location?.country !== 'United States' ? `, ${course.location?.country}` : ''}
                  </p>
                  <Badge variant="outline" className="mt-2">ID: {course.id}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Course Details Section */}
      {courseDetails && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Course Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-1">{courseDetails.course_name}</h3>
              <p className="text-md mb-1">{courseDetails.club_name}</p>
              <p className="text-muted-foreground mb-4">
                {courseDetails.location?.city}{courseDetails.location?.state ? `, ${courseDetails.location?.state}` : ''}
                {courseDetails.location?.country && courseDetails.location?.country !== 'United States' ? `, ${courseDetails.location?.country}` : ''}
              </p>
              
              <Separator className="my-4" />
              
              {/* Male Tees */}
              {courseDetails.tees?.male && courseDetails.tees.male.length > 0 && (
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
              {courseDetails.tees?.female && courseDetails.tees.female.length > 0 && (
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
              
              {/* Course Features */}
              {courseDetails.features && courseDetails.features.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {courseDetails.features.map((feature, index) => (
                      <Badge key={index} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Course Website */}
              {courseDetails.website && (
                <div className="mt-4">
                  <h4 className="font-medium mb-1">Website:</h4>
                  <p className="text-sm">{courseDetails.website}</p>
                </div>
              )}
              
              {/* Price Range */}
              {courseDetails.price_range && (
                <div className="mt-2">
                  <h4 className="font-medium mb-1">Price Range:</h4>
                  <p className="text-sm">{courseDetails.price_range}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Raw API Response (only shown for debugging) */}
      {rawResponse && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Raw API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md overflow-x-auto">
              <pre className="text-xs whitespace-pre-wrap">{rawResponse}</pre>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="mt-6 p-4 border rounded-md bg-muted/30">
        <h3 className="font-medium mb-2">API Integration Notes:</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Requests proxied through Edge Function (API key kept server-side)</li>
          <li>Edge Function URL: {API_CONFIG.EDGE_FUNCTION_URL}</li>
          <li>Search: ?action=search&q=query</li>
          <li>Course Details: ?action=course&id=courseId</li>
          <li>Health: ?action=health</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiTest;
