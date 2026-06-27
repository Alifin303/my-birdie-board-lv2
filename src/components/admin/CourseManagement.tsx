import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, ChevronRight, ChevronDown, Loader2, MapPin } from "lucide-react";
import { CourseEditor } from "./CourseEditor";
import { fetchAndStoreCoordsFromApi } from "@/lib/course-coords";
import { useToast } from "@/hooks/use-toast";

interface CoursePlayer {
  user_id: string;
  name: string;
  email: string | null;
  roundsCount: number;
}

interface Course {
  id: number;
  name: string;
  city: string | null;
  state: string | null;
  api_course_id: string | null;
  user_id: string | null;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
}

export function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
  const [playersByCourse, setPlayersByCourse] = useState<Record<number, CoursePlayer[]>>({});
  const [playersLoading, setPlayersLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('name');

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayersForCourse = async (courseId: number) => {
    setPlayersLoading(prev => ({ ...prev, [courseId]: true }));
    try {
      const { data: rounds, error } = await supabase
        .from('rounds')
        .select('user_id')
        .eq('course_id', courseId);
      if (error) throw error;

      const counts = new Map<string, number>();
      (rounds || []).forEach(r => {
        counts.set(r.user_id, (counts.get(r.user_id) || 0) + 1);
      });

      const userIds = Array.from(counts.keys());
      let profiles: Array<{ id: string; username: string | null; first_name: string | null; last_name: string | null; email: string | null }> = [];
      if (userIds.length > 0) {
        const { data: profileData, error: pErr } = await supabase
          .from('profiles')
          .select('id, username, first_name, last_name, email')
          .in('id', userIds);
        if (pErr) throw pErr;
        profiles = profileData || [];
      }

      const profileMap = new Map(profiles.map(p => [p.id, p]));
      const players: CoursePlayer[] = userIds.map(uid => {
        const p = profileMap.get(uid);
        const fullName = p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : '';
        const name = fullName || p?.username || p?.email || 'Unknown user';
        return {
          user_id: uid,
          name,
          email: p?.email || null,
          roundsCount: counts.get(uid) || 0,
        };
      }).sort((a, b) => b.roundsCount - a.roundsCount);

      setPlayersByCourse(prev => ({ ...prev, [courseId]: players }));
    } catch (err) {
      console.error('Error fetching players for course:', err);
      setPlayersByCourse(prev => ({ ...prev, [courseId]: [] }));
    } finally {
      setPlayersLoading(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const toggleExpand = (courseId: number) => {
    if (expandedCourseId === courseId) {
      setExpandedCourseId(null);
      return;
    }
    setExpandedCourseId(courseId);
    if (!playersByCourse[courseId]) {
      fetchPlayersForCourse(courseId);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedCourse) {
    return (
      <CourseEditor
        course={selectedCourse}
        onBack={() => {
          setSelectedCourse(null);
          fetchCourses();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Course Management</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name, city, or state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">Loading courses...</div>
      ) : (
        <div className="space-y-2">
          {filteredCourses.map((course) => {
            const isExpanded = expandedCourseId === course.id;
            const players = playersByCourse[course.id];
            const isLoadingPlayers = playersLoading[course.id];
            return (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => toggleExpand(course.id)}
                      className="flex items-center gap-3 flex-1 text-left"
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{course.name}</h3>
                          {!course.api_course_id && (
                            <Badge variant="secondary">User Added</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {course.city && course.state
                            ? `${course.city}, ${course.state}`
                            : course.city || course.state || 'Location not specified'}
                        </p>
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCourse(course)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pl-7 border-t pt-3">
                      {isLoadingPlayers ? (
                        <div className="text-sm text-muted-foreground py-2">Loading players...</div>
                      ) : !players || players.length === 0 ? (
                        <div className="text-sm text-muted-foreground py-2">
                          No rounds have been played at this course yet.
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-sm font-medium mb-2">
                            {players.length} {players.length === 1 ? 'player' : 'players'} ·{' '}
                            {players.reduce((sum, p) => sum + p.roundsCount, 0)} total rounds
                          </div>
                          {players.map(player => (
                            <div
                              key={player.user_id}
                              className="flex items-center justify-between py-1.5 text-sm"
                            >
                              <div>
                                <span className="font-medium">{player.name}</span>
                                {player.email && (
                                  <span className="text-muted-foreground ml-2">
                                    {player.email}
                                  </span>
                                )}
                              </div>
                              <Badge variant="outline">
                                {player.roundsCount} {player.roundsCount === 1 ? 'round' : 'rounds'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {filteredCourses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No courses found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

