import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { searchForCourses } from "@/components/course-selector/CourseDataService";
import { useQueryClient } from "@tanstack/react-query";

interface CourseDetails {
  id: number;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  tees?: any[];
  userRounds?: number;
  bestScore?: number;
  courseStats?: {
    roundsPlayed: number;
    averageScore: number;
    bestGrossScore: number;
    bestToPar: number;
  };
}

const Course = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isBot, setIsBot] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const botPattern = /bot|googlebot|crawler|spider|robot|crawling/i;
    const isSearchEngine = botPattern.test(navigator.userAgent);
    setIsBot(isSearchEngine);
    
    if (!isSearchEngine && !loading && course) {
      const timer = setTimeout(() => {
        setShouldRedirect(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [loading, course]);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      
      if (!courseId) {
        setLoading(false);
        return;
      }
      
      try {
        const courseIdNumber = parseInt(courseId, 10);
        
        if (isNaN(courseIdNumber)) {
          console.error("Invalid course ID:", courseId);
          setCourse(null);
          setLoading(false);
          return;
        }
        
        const { data: courseData, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseIdNumber)
          .single();
          
        if (courseData && !error) {
          console.log("Found course in database:", courseData);
          
          const { data: roundsData, error: roundsError } = await supabase
            .from('rounds')
            .select('gross_score, to_par_gross')
            .eq('course_id', courseIdNumber);
            
          if (!roundsError && roundsData) {
            const courseStats = calculateCourseStats(roundsData);
            setCourse({
              ...courseData,
              courseStats
            });
          } else {
            setCourse(courseData);
          }
          
          const { data: teeData } = await supabase
            .from('course_tees')
            .select('*')
            .eq('course_id', courseIdNumber);
            
          if (teeData && teeData.length > 0) {
            setCourse(current => current ? {...current, tees: teeData} : null);
          }
          
        } else {
          console.log("Course not found in database, trying API");
          const searchResult = await searchForCourses(courseId);
          
          if (searchResult && searchResult.length > 0) {
            setCourse(searchResult[0]);
          } else {
            console.log("Course not found via API either");
            setCourse(null);
          }
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (isBot || !shouldRedirect) {
      fetchCourseDetails();
    }
  }, [courseId, isBot, shouldRedirect]);
  
  if (shouldRedirect && !isBot) {
    return <Navigate to="/" replace />;
  }
  
  const calculateCourseStats = (rounds: any[]) => {
    if (!rounds || rounds.length === 0) {
      return {
        roundsPlayed: 0,
        averageScore: 0,
        bestGrossScore: 0,
        bestToPar: 0
      };
    }
    
    const roundsPlayed = rounds.length;
    const scores = rounds.map(r => r.gross_score).filter(Boolean);
    const toPars = rounds.map(r => r.to_par_gross).filter(Boolean);
    
    const averageScore = scores.length > 0 
      ? Math.round(scores.reduce((acc, curr) => acc + curr, 0) / scores.length) 
      : 0;
      
    const bestGrossScore = scores.length > 0 
      ? Math.min(...scores) 
      : 0;
      
    const bestToPar = toPars.length > 0 
      ? Math.min(...toPars) 
      : 0;
      
    return {
      roundsPlayed,
      averageScore,
      bestGrossScore,
      bestToPar
    };
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Loading course information...</h1>
        </div>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Course not found</h1>
          <p className="mt-2">The requested golf course could not be found.</p>
        </div>
      </div>
    );
  }
  
  const courseName = course.name || `Golf Course #${courseId}`;
  const courseLocation = [course.city, course.state].filter(Boolean).join(", ");
  
  const generateGeoStructuredData = () => {
    if (!course.latitude || !course.longitude) return null;
    
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "GolfCourse",
      "name": courseName,
      "description": `Golf course statistics and leaderboard for ${courseName}${courseLocation ? ` in ${courseLocation}` : ''}.`,
      "url": `https://mybirdieboard.com/courses/${courseId}`,
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": course.latitude,
        "longitude": course.longitude
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": course.city || "",
        "addressRegion": course.state || "",
        "addressCountry": course.country || ""
      }
    });
  };
  
  return (
    <>
      <Helmet>
        <title>{`${courseName} | Golf Course Statistics and Leaderboard | MyBirdieBoard`}</title>
        <meta 
          name="description" 
          content={`View statistics, leaderboard, and course information for ${courseName}${courseLocation ? ` in ${courseLocation}` : ''}. Track your rounds and compete with friends at this course on MyBirdieBoard.`} 
        />
        <link rel="canonical" href={`https://mybirdieboard.com/courses/${courseId}`} />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${courseName} | Golf Course Statistics`} />
        <meta 
          property="og:description" 
          content={`View statistics, leaderboard, and course information for ${courseName}${courseLocation ? ` in ${courseLocation}` : ''}.`} 
        />
        <meta property="og:url" content={`https://mybirdieboard.com/courses/${courseId}`} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${courseName} | Golf Course Statistics`} />
        <meta 
          name="twitter:description" 
          content={`View statistics, leaderboard, and course information for ${courseName}${courseLocation ? ` in ${courseLocation}` : ''}.`} 
        />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SportsActivityLocation",
            "name": courseName,
            ...(courseLocation && { "address": {
              "@type": "PostalAddress",
              "addressLocality": course.city || "",
              "addressRegion": course.state || ""
            }}),
            "url": `https://mybirdieboard.com/courses/${courseId}`,
            "description": `Golf course statistics and leaderboard for ${courseName}${courseLocation ? ` in ${courseLocation}` : ''}.`
          })}
        </script>
        
        {course.latitude && course.longitude && (
          <script type="application/ld+json">
            {generateGeoStructuredData()}
          </script>
        )}
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6">
            {courseName}
          </h1>
          
          {courseLocation && (
            <h2 className="text-xl text-center mb-8 text-muted-foreground">
              {courseLocation}
            </h2>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {course.courseStats && (
              <>
                <div className="bg-card rounded-lg shadow-sm p-6 text-center">
                  <h3 className="text-lg font-medium mb-2">Rounds Played</h3>
                  <p className="text-3xl font-bold">{course.courseStats.roundsPlayed}</p>
                </div>
                
                <div className="bg-card rounded-lg shadow-sm p-6 text-center">
                  <h3 className="text-lg font-medium mb-2">Best Score</h3>
                  <p className="text-3xl font-bold">{course.courseStats.bestGrossScore || "N/A"}</p>
                </div>
                
                <div className="bg-card rounded-lg shadow-sm p-6 text-center">
                  <h3 className="text-lg font-medium mb-2">Average Score</h3>
                  <p className="text-3xl font-bold">{course.courseStats.averageScore || "N/A"}</p>
                </div>
              </>
            )}
          </div>
          
          {course.tees && course.tees.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Tee Options</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-3 text-left">Tee Name</th>
                      <th className="p-3 text-left">Par</th>
                      <th className="p-3 text-left">Yards</th>
                      <th className="p-3 text-left">Rating</th>
                      <th className="p-3 text-left">Slope</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {course.tees.map((tee, index) => (
                      <tr key={index} className="hover:bg-muted/50">
                        <td className="p-3">{tee.name || "Standard"}</td>
                        <td className="p-3">{tee.par || "72"}</td>
                        <td className="p-3">{tee.yards || "N/A"}</td>
                        <td className="p-3">{tee.rating || "N/A"}</td>
                        <td className="p-3">{tee.slope || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Course;
