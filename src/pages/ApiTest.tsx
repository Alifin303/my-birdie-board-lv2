
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { searchCourses, getCourseDetails, GolfCourse, CourseDetail, API_CONFIG } from "@/services/golfCourseApi";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  const [useExtendedMock, setUseExtendedMock] = useState<boolean>(true);
  const [useRealApi, setUseRealApi] = useState<boolean>(API_CONFIG.USE_REAL_API);

  // Predefined locations for quick searching
  const popularLocations = [
    { label: "Dallas, TX", value: "dallas" },
    { label: "Orlando, FL", value: "orlando" },
    { label: "Pebble Beach, CA", value: "pebble beach" },
    { label: "Augusta, GA", value: "augusta" },
    { label: "St Andrews, Scotland", value: "st andrews" },
    { label: "Rayleigh, UK", value: "rayleigh" },
    { label: "New York, NY", value: "new york" }
  ];

  // Initialize with current API_CONFIG settings
  useEffect(() => {
    setUseRealApi(API_CONFIG.USE_REAL_API);
    setUseExtendedMock(API_CONFIG.USE_EXTENDED_MOCK);
  }, []);

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
      
      // Add diagnostic logging of the mock courses before filtering
      const { mockCourses, results } = await searchCourses(searchQuery, true);
      
      console.log("Available mock courses:", mockCourses);
      console.log("API search response:", results);
      
      // Store raw response for debugging
      setRawResponse(JSON.stringify(results, null, 2));
      
      setSearchResults(results);
      
      // Add diagnostic info about the search
      const diagInfo = [
        `Search query: "${searchQuery}"`,
        `Search performed: ${new Date().toISOString()}`,
        `Live API enabled: ${API_CONFIG.USE_REAL_API ? 'Yes' : 'No'}`,
        `Available courses in mock data: ${mockCourses.length}`,
        `Matching courses found: ${results.length}`,
        `Search is case-insensitive: Yes`,
        `Search looks for partial matches: Yes`,
      ];
      
      if (API_CONFIG.USE_REAL_API) {
        diagInfo.push(`API URL: ${API_CONFIG.API_URL}/courses/search`);
        diagInfo.push(`Request params: q=${searchQuery}, limit=50`);
      }
      
      if (mockCourses.length > 0 && !API_CONFIG.USE_REAL_API) {
        diagInfo.push(`\nSample of available mock courses:`);
        mockCourses.slice(0, 5).forEach((course, idx) => {
          diagInfo.push(`${idx + 1}. ${course.club_name} - ${course.course_name} (ID: ${course.id}, Location: ${course.location?.city}, ${course.location?.state})`);
        });
      }
      
      if (results.length > 0) {
        diagInfo.push(`\nMatching courses:`);
        results.forEach((course, idx) => {
          diagInfo.push(`${idx + 1}. ${course.club_name} - ${course.course_name} (ID: ${course.id}, Location: ${course.location?.city}, ${course.location?.state})`);
        });
      } else {
        diagInfo.push(`\nSearch algorithm details:`);
        diagInfo.push(`- Normalizes query to lowercase: "${searchQuery.toLowerCase()}"`);
        diagInfo.push(`- Checks club_name, course_name, city, state, and country fields`);
        diagInfo.push(`- Uses string.includes() for partial matching`);
      }
      
      setDiagnosticInfo(diagInfo.join('\n'));
      
      if (results.length === 0) {
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
      
      // Store raw response for debugging
      setRawResponse(JSON.stringify(details, null, 2));
      
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

  const handleLocationSelect = (locationValue: string) => {
    setSearchQuery(locationValue);
    setLocation("");  // Reset the dropdown after selection
    handleSearch();  // Automatically trigger search
  };

  const toggleExtendedMock = () => {
    const newValue = !useExtendedMock;
    setUseExtendedMock(newValue);
    
    // Update the global config
    API_CONFIG.USE_EXTENDED_MOCK = newValue;
    console.log(`Extended mock data ${newValue ? 'enabled' : 'disabled'}`);
  };

  const toggleRealApi = () => {
    const newValue = !useRealApi;
    setUseRealApi(newValue);
    
    // Update the global config
    API_CONFIG.USE_REAL_API = newValue;
    console.log(`Live API ${newValue ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Golf Course API Test</h1>
      
      {/* Search Section */}
      <div className="border rounded-lg p-6 mb-8 bg-card">
        <h2 className="text-xl font-semibold mb-4">Test Course Search</h2>
        
        {/* API Configuration Toggles */}
        <div className="space-y-3 mb-4 border-b pb-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="live-api"
              checked={useRealApi}
              onCheckedChange={toggleRealApi}
            />
            <Label htmlFor="live-api" className="font-medium">
              Use Live API (Search real golf course data)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="extended-mock"
              checked={useExtendedMock}
              onCheckedChange={toggleExtendedMock}
            />
            <Label htmlFor="extended-mock">
              Use Extended Mock Data (Fallback if API fails)
            </Label>
          </div>
          <div className="text-xs text-muted-foreground italic">
            Current API URL: {API_CONFIG.API_URL}
          </div>
        </div>
        
        {/* Search Input */}
        <div className="flex gap-2 mb-4">
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
              {courseDetails.location?.city}{courseDetails.location?.state ? `, ${courseDetails.location?.state}` : ''}
              {courseDetails.location?.country && courseDetails.location?.country !== 'United States' ? `, ${courseDetails.location?.country}` : ''}
            </p>
            
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
                    <span key={index} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                      {feature}
                    </span>
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
        </div>
      )}
      
      <div className="mt-6 p-4 border rounded-md bg-muted/30">
        <h3 className="font-medium mb-2">API Integration Notes:</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Live API is now {API_CONFIG.USE_REAL_API ? 'enabled' : 'disabled'} for all searches</li>
          <li>Mock data will be used as a fallback if the live API search fails</li>
          <li>The API URL is configured to: {API_CONFIG.API_URL}</li>
          <li>Try searching for locations like "Dallas", "Augusta", "Rayleigh", or "Pebble Beach"</li>
          <li>You can toggle between using the live API and mock data using the switches above</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiTest;
