
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { searchCourses, getCourseDetails } from "@/services/golfCourseApi";

const ApiTest = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseDetails, setCourseDetails] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery) return;
    
    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    setCourseDetails(null);
    
    try {
      console.log("Testing searchCourses API with query:", searchQuery);
      const courses = await searchCourses(searchQuery);
      console.log("API search response:", courses);
      setSearchResults(courses);
      
      if (courses.length === 0) {
        setError("No courses found with that name.");
      }
    } catch (err) {
      console.error("API search error:", err);
      setError("An error occurred while searching for courses.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetDetails = async (courseId: string) => {
    setIsLoading(true);
    setError(null);
    setCourseDetails(null);
    setSelectedCourseId(courseId);
    
    try {
      console.log("Testing getCourseDetails API with id:", courseId);
      const details = await getCourseDetails(courseId);
      console.log("API details response:", details);
      setCourseDetails(details);
      
      if (!details) {
        setError("Failed to get course details.");
      }
    } catch (err) {
      console.error("API details error:", err);
      setError("An error occurred while fetching course details.");
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
          />
          <Button 
            onClick={handleSearch} 
            disabled={isLoading || !searchQuery}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Search
          </Button>
        </div>
        
        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Search Results:</h3>
            <div className="border rounded-md divide-y">
              {searchResults.map((course) => (
                <div 
                  key={course.id} 
                  className={`p-4 hover:bg-muted cursor-pointer ${selectedCourseId === course.id ? 'bg-muted' : ''}`}
                  onClick={() => handleGetDetails(course.id)}
                >
                  <p className="font-medium">{course.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {course.city}{course.state ? `, ${course.state}` : ''}
                    {course.country && course.country !== 'USA' ? `, ${course.country}` : ''}
                  </p>
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
            <h3 className="text-lg font-medium mb-1">{courseDetails.name}</h3>
            <p className="text-muted-foreground mb-4">
              {courseDetails.city}{courseDetails.state ? `, ${courseDetails.state}` : ''}
              {courseDetails.country && courseDetails.country !== 'USA' ? `, ${courseDetails.country}` : ''}
            </p>
            
            {/* Tees */}
            <h4 className="font-medium mb-2">Tees:</h4>
            <div className="grid gap-2 mb-6">
              {courseDetails.tees.map((tee: any) => (
                <div key={tee.id} className="p-3 border rounded-md bg-background">
                  <p className="font-medium">{tee.name}</p>
                  <p className="text-sm">Rating: {tee.rating}, Slope: {tee.slope}, Par: {tee.par}</p>
                </div>
              ))}
            </div>
            
            {/* Holes */}
            <h4 className="font-medium mb-2">Holes:</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Hole</th>
                    <th className="text-left py-2 px-4">Par</th>
                    <th className="text-left py-2 px-4">Handicap</th>
                    <th className="text-left py-2 px-4">Yards (First Tee)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {courseDetails.holes.map((hole: any) => {
                    const firstTeeId = courseDetails.tees[0]?.id;
                    const yards = firstTeeId ? hole.yards[firstTeeId] : '-';
                    
                    return (
                      <tr key={hole.id} className="hover:bg-muted/50">
                        <td className="py-2 px-4">{hole.number}</td>
                        <td className="py-2 px-4">{hole.par}</td>
                        <td className="py-2 px-4">{hole.handicap}</td>
                        <td className="py-2 px-4">{yards}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiTest;
