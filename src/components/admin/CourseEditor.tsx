import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { TeeEditor } from "./TeeEditor";

interface Course {
  id: number;
  name: string;
  city: string | null;
  state: string | null;
  api_course_id: string | null;
  user_id: string | null;
}

interface Tee {
  id: string;
  tee_id: string;
  name: string;
  color: string | null;
  gender: string | null;
  rating: number | null;
  slope: number | null;
  par: number | null;
  yards: number | null;
}

interface CourseEditorProps {
  course: Course;
  onBack: () => void;
}

export function CourseEditor({ course, onBack }: CourseEditorProps) {
  const [courseData, setCourseData] = useState(course);
  const [tees, setTees] = useState<Tee[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTee, setSelectedTee] = useState<Tee | null>(null);
  const [showAddTee, setShowAddTee] = useState(false);

  useEffect(() => {
    fetchTees();
  }, [course.id]);

  const fetchTees = async () => {
    try {
      const { data, error } = await supabase
        .from('course_tees')
        .select('*')
        .eq('course_id', course.id)
        .order('name');

      if (error) throw error;
      setTees(data || []);
    } catch (error) {
      console.error('Error fetching tees:', error);
      toast.error('Failed to load tees');
    }
  };

  const handleSaveCourse = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('courses')
        .update({
          name: courseData.name,
          city: courseData.city,
          state: courseData.state
        })
        .eq('id', course.id);

      if (error) throw error;
      toast.success('Course updated successfully');
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  if (selectedTee) {
    return (
      <TeeEditor
        tee={selectedTee}
        courseId={course.id}
        onBack={() => {
          setSelectedTee(null);
          fetchTees();
        }}
      />
    );
  }

  if (showAddTee) {
    return (
      <TeeEditor
        tee={null}
        courseId={course.id}
        onBack={() => {
          setShowAddTee(false);
          fetchTees();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Course Name</Label>
            <Input
              id="name"
              value={courseData.name}
              onChange={(e) => setCourseData({ ...courseData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={courseData.city || ''}
                onChange={(e) => setCourseData({ ...courseData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={courseData.state || ''}
                onChange={(e) => setCourseData({ ...courseData, state: e.target.value })}
              />
            </div>
          </div>
          <Button onClick={handleSaveCourse} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Save Course Details
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tees</CardTitle>
          <Button size="sm" onClick={() => setShowAddTee(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tee
          </Button>
        </CardHeader>
        <CardContent>
          {tees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tees configured. Add a tee to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {tees.map((tee) => (
                <Card key={tee.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <h4 className="font-semibold">{tee.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Rating: {tee.rating || 'N/A'} | Slope: {tee.slope || 'N/A'} | Par: {tee.par || 'N/A'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTee(tee)}
                    >
                      Edit
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
