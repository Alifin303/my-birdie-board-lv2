
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: number;
  name: string;
  city?: string;
  state?: string;
  roundsCount?: number;
}

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isBot, setIsBot] = useState(false);
  
  // Check if the visitor is a bot/crawler
  useEffect(() => {
    const botPattern = /bot|googlebot|crawler|spider|robot|crawling/i;
    const isSearchEngine = botPattern.test(navigator.userAgent);
    setIsBot(isSearchEngine);
    
    // Only set redirect for real users, not search engines
    if (!isSearchEngine) {
      // Short delay to allow the page to be indexed
      const timer = setTimeout(() => {
        setShouldRedirect(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        // Get courses from the database with rounds count
        const { data, error } = await supabase
          .from('courses')
          .select('id, name, city, state')
          .order('name');
          
        if (error) throw error;
        
        if (data) {
          // Get the round counts for each course
          const courseIds = data.map(course => course.id);
          
          if (courseIds.length > 0) {
            // Use individual queries for each course to get count
            const coursesWithCounts = await Promise.all(
              data.map(async (course) => {
                const { count, error: countError } = await supabase
                  .from('rounds')
                  .select('*', { count: 'exact', head: true })
                  .eq('course_id', course.id);
                  
                return {
                  ...course,
                  roundsCount: countError ? 0 : (count || 0)
                };
              })
            );
            
            setCourses(coursesWithCounts);
          } else {
            setCourses([]);
          }
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch the data if it's a bot or we haven't loaded yet
    if (isBot || !shouldRedirect) {
      fetchCourses();
    }
  }, [isBot, shouldRedirect]);
  
  // Redirect real users to the homepage
  if (shouldRedirect && !isBot) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <>
      <Helmet>
        <title>Golf Courses | MyBirdieBoard</title>
        <meta 
          name="description" 
          content="Browse golf courses, view course statistics, and track your golf performance on MyBirdieBoard. Find courses by location and compare your scores with other golfers." 
        />
        <link rel="canonical" href="https://mybirdieboard.com/courses" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Golf Courses | MyBirdieBoard" />
        <meta 
          property="og:description" 
          content="Browse golf courses, view course statistics, and track your golf performance on MyBirdieBoard." 
        />
        <meta property="og:url" content="https://mybirdieboard.com/courses" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Golf Courses | MyBirdieBoard" />
        <meta 
          name="twitter:description" 
          content="Browse golf courses, view course statistics, and track your golf performance on MyBirdieBoard." 
        />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6">
            Golf Courses
          </h1>
          
          <p className="text-center mb-8 text-muted-foreground max-w-2xl mx-auto">
            Browse golf courses where players have tracked rounds on MyBirdieBoard. Click on a course to view detailed statistics, 
            historical scores, and course information.
          </p>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-lg">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg">No courses found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-card rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <Link to={`/courses/${course.id}`} className="block p-6">
                    <h2 className="text-xl font-semibold mb-2 line-clamp-2">{course.name}</h2>
                    
                    {(course.city || course.state) && (
                      <p className="text-muted-foreground mb-4">
                        {[course.city, course.state].filter(Boolean).join(", ")}
                      </p>
                    )}
                    
                    {course.roundsCount !== undefined && (
                      <p className="text-sm">
                        <span className="font-medium">{course.roundsCount}</span> {course.roundsCount === 1 ? 'round' : 'rounds'} played
                      </p>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Courses;
