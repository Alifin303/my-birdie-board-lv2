

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { courseDisplayName, staticCourses } from "@/lib/course-seo";

interface Course {
  id: number;
  name: string;
  city?: string;
  state?: string;
}

const initialCourses: Course[] = staticCourses.map((c) => ({
  id: c.id,
  name: c.name,
  city: c.city ?? undefined,
  state: c.state ?? undefined,
}));

const Courses = () => {
  // Rendered from the build-time snapshot so every course link is in the
  // initial HTML, then refreshed with live data on the client.
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchCourses = async () => {
      try {
        setLoading(true);
        const { data, error } = await (supabase as any).rpc("get_public_courses");
        if (error || cancelled || !Array.isArray(data)) return;

        setCourses(
          data.map((c: any) => ({
            id: c.id,
            name: c.name,
            city: c.city ?? undefined,
            state: c.state ?? undefined,
          }))
        );
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCourses();
    return () => {
      cancelled = true;
    };
  }, []);
  
  
  return (
    <>
      <SEOHead
        title="Golf Courses Directory | MyBirdieBoard"
        description="Browse golf courses by location, view course details, and try an interactive scorecard with MyBirdieBoard."
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
          
          <p className="text-center mb-3 text-muted-foreground max-w-2xl mx-auto">
            Browse golf courses where players have tracked rounds on MyBirdieBoard. Select a course to view its details and scorecard.
          </p>
          <p className="text-center mb-8 text-muted-foreground max-w-2xl mx-auto">
            Don&apos;t see your course?{" "}
            <Link to="/get-started" className="font-medium text-primary underline underline-offset-4">
              Add it in seconds when you log your first round
            </Link>
            .
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
                    <h2 className="text-xl font-semibold mb-2 line-clamp-2">{courseDisplayName(course.name)}</h2>
                    
                    {(course.city || course.state) && (
                      <p className="text-muted-foreground">
                        {[course.city, course.state].filter(Boolean).join(", ")}
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
