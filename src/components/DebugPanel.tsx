
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [courseData, setCourseData] = useState<any[]>([]);
  const [roundData, setRoundData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchDebugData = async () => {
    setIsLoading(true);
    try {
      // Fetch courses
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('id');
      
      if (coursesError) {
        console.error("Error fetching course data:", coursesError);
      } else {
        setCourseData(courses || []);
      }
      
      // Fetch recent rounds
      const { data: rounds, error: roundsError } = await supabase
        .from('rounds')
        .select(`
          *,
          courses:course_id(id, name, city, state)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (roundsError) {
        console.error("Error fetching round data:", roundsError);
      } else {
        setRoundData(rounds || []);
      }
    } catch (error) {
      console.error("Debug data fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          variant="outline" 
          onClick={() => setIsOpen(true)}
          className="bg-background/80 backdrop-blur-sm"
        >
          Debug Data
        </Button>
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] bg-background border rounded-lg shadow-lg overflow-hidden">
      <div className="p-3 border-b flex justify-between items-center bg-primary text-primary-foreground">
        <h3 className="font-medium">Database Debug Panel</h3>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          Close
        </Button>
      </div>
      
      <div className="p-3 border-b flex gap-2">
        <Button 
          onClick={fetchDebugData} 
          size="sm" 
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Refresh Data'}
        </Button>
      </div>
      
      <ScrollArea className="h-[60vh]">
        <div className="p-3 space-y-4">
          <div>
            <h4 className="font-medium mb-2">Courses ({courseData.length})</h4>
            {courseData.length > 0 ? (
              <div className="space-y-2">
                {courseData.map(course => (
                  <div key={course.id} className="border rounded p-2 text-sm">
                    <p><strong>ID:</strong> {course.id}</p>
                    <p><strong>Name:</strong> {course.name}</p>
                    <p><strong>API ID:</strong> {course.api_course_id || 'None'}</p>
                    <p><strong>Location:</strong> {course.city}{course.state ? `, ${course.state}` : ''}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No courses found</p>
            )}
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Recent Rounds ({roundData.length})</h4>
            {roundData.length > 0 ? (
              <div className="space-y-2">
                {roundData.map(round => (
                  <div key={round.id} className="border rounded p-2 text-sm">
                    <p><strong>ID:</strong> {round.id}</p>
                    <p><strong>Course:</strong> {round.courses?.name || 'Unknown'}</p>
                    <p><strong>Course ID:</strong> {round.course_id}</p>
                    <p><strong>Date:</strong> {new Date(round.date).toLocaleDateString()}</p>
                    <p><strong>Score:</strong> {round.gross_score} (To Par: {round.to_par_gross > 0 ? '+' : ''}{round.to_par_gross})</p>
                    <p><strong>Tee:</strong> {round.tee_name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No rounds found</p>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
