
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  const [redirecting, setRedirecting] = useState(false);
  
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
            // Using a raw SQL query with .rpc() instead of .group()
            const { data: roundCounts, error: roundsError } = await supabase
              .rpc('get_course_round_counts', { course_ids: courseIds });
              
            if (!roundsError && roundCounts) {
              // Create a map of course_id to count
              const countsMap = new Map();
              roundCounts.forEach(item => {
                countsMap.set(item.course_id, item.count);
              });
              
              // Add the counts to the courses
              const coursesWithCounts = data.map(course => ({
                ...course,
                roundsCount: countsMap.get(course.id) || 0
              }));
              
              setCourses(coursesWithCounts);
            } else {
              // Alternative approach: fetch counts individually
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
            }
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
    
    fetchCourses();
  }, []);
  
  useEffect(() => {
    // Only redirect if this is a real user visit (not a crawler)
    const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(
      navigator.userAgent
    );
    
    if (!isBot && !loading && !redirecting) {
      const timer = setTimeout(() => {
        setRedirecting(true);
      }, 1000); // short delay before redirecting
      
      return () => clearTimeout(timer);
    }
  }, [loading, redirecting]);
  
  if (redirecting) {
    return (
      <meta httpEquiv="refresh" content="0;url=/" />
    );
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
          
          <div className="text-center py-10 mt-10">
            <p className="mb-4">You are being redirected to MyBirdieBoard...</p>
            <a href="/" className="text-primary hover:underline">
              Click here if you're not redirected automatically
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Courses;
