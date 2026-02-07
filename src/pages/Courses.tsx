
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
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
  
  useEffect(() => {
    // SSR-safe check for navigator
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return;
    }
    
    const botPattern = /bot|googlebot|crawler|spider|robot|crawling/i;
    const isSearchEngine = botPattern.test(navigator.userAgent);
    setIsBot(isSearchEngine);
    
    if (!isSearchEngine) {
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
        
        const { data, error } = await supabase
          .from('courses')
          .select('id, name, city, state')
          .order('name');
          
        if (error) throw error;
        
        if (data) {
          const courseIds = data.map(course => course.id);
          
          if (courseIds.length > 0) {
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
    
    if (isBot || !shouldRedirect) {
      fetchCourses();
    }
  }, [isBot, shouldRedirect]);
  
  if (shouldRedirect && !isBot) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <>
      <SEOHead
        title="Golf Courses Directory | MyBirdieBoard"
        description="Browse golf courses with player stats and leaderboards. Find courses by location and compare your scores with other golfers."
      >
        <link rel="alternate" hrefLang="en" href="https://mybirdieboard.com/courses" />
        <link rel="alternate" hrefLang="en-us" href="https://mybirdieboard.com/courses" />
        <link rel="alternate" hrefLang="en-gb" href="https://mybirdieboard.com/courses" />
        <link rel="alternate" hrefLang="x-default" href="https://mybirdieboard.com/courses" />
        
        <meta name="geo.region" content="US, GB, AU, CA" /> 
        <meta name="geo.position" content="39.8283;-98.5795" />
        <meta name="ICBM" content="39.8283, -98.5795" />
      </SEOHead>
      
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
