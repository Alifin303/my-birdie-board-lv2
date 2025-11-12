import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, ChevronRight } from "lucide-react";
import { CourseEditor } from "./CourseEditor";

interface Course {
  id: number;
  name: string;
  city: string | null;
  state: string | null;
  api_course_id: string | null;
  user_id: string | null;
  created_at: string;
}

export function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

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
          {filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between p-4">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCourse(course)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
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
