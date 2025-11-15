import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

interface HoleData {
  id?: string;
  hole_number: number;
  par: number;
  yards: number | null;
  handicap: number | null;
}

interface TeeEditorProps {
  tee: Tee | null;
  courseId: number;
  onBack: () => void;
}

export function TeeEditor({ tee, courseId, onBack }: TeeEditorProps) {
  const [teeData, setTeeData] = useState<Omit<Tee, 'id'>>({
    tee_id: tee?.tee_id || `${courseId}-${Date.now()}`,
    name: tee?.name || '',
    color: tee?.color || '',
    gender: tee?.gender || '',
    rating: tee?.rating || null,
    slope: tee?.slope || 113,
    par: tee?.par || null,
    yards: tee?.yards || null,
  });
  const [holes, setHoles] = useState<HoleData[]>([]);
  const [holeCount, setHoleCount] = useState<9 | 18>(18);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tee?.id) {
      fetchHoles();
    } else {
      // Initialize 18 holes for new tee
      setHoles(Array.from({ length: 18 }, (_, i) => ({
        hole_number: i + 1,
        par: 4,
        yards: null,
        handicap: i + 1,
      })));
    }
  }, [tee]);

  useEffect(() => {
    // Update hole count based on actual holes loaded
    if (holes.length > 0) {
      setHoleCount(holes.length <= 9 ? 9 : 18);
    }
  }, [holes.length]);

  const fetchHoles = async () => {
    if (!tee?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('course_holes')
        .select('*')
        .eq('tee_id', tee.id)
        .order('hole_number');

      if (error) throw error;
      
      if (data && data.length > 0) {
        setHoles(data);
      } else {
        // Initialize 18 holes if none exist
        setHoles(Array.from({ length: 18 }, (_, i) => ({
          hole_number: i + 1,
          par: 4,
          yards: null,
          handicap: i + 1,
        })));
      }
    } catch (error) {
      console.error('Error fetching holes:', error);
    }
  };

  const calculateTotals = () => {
    const totalPar = holes.reduce((sum, hole) => sum + (hole.par || 0), 0);
    const totalYards = holes.reduce((sum, hole) => sum + (hole.yards || 0), 0);
    return { totalPar, totalYards };
  };

  const handleSaveTee = async () => {
    try {
      setLoading(true);
      const { totalPar, totalYards } = calculateTotals();

      if (tee?.id) {
        // Update existing tee
        const { error: teeError } = await supabase
          .from('course_tees')
          .update({
            name: teeData.name,
            color: teeData.color,
            gender: teeData.gender,
            rating: teeData.rating,
            slope: teeData.slope,
            par: totalPar,
            yards: totalYards,
          })
          .eq('id', tee.id);

        if (teeError) throw teeError;

        // Update or insert holes
        for (const hole of holes) {
          if (hole.id) {
            const { error } = await supabase
              .from('course_holes')
              .update({
                par: hole.par,
                yards: hole.yards,
                handicap: hole.handicap,
              })
              .eq('id', hole.id);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('course_holes')
              .insert({
                tee_id: tee.id,
                hole_number: hole.hole_number,
                par: hole.par,
                yards: hole.yards,
                handicap: hole.handicap,
              });
            if (error) throw error;
          }
        }

        toast.success('Tee updated successfully');
      } else {
        // Insert new tee
        const { data: newTee, error: teeError } = await supabase
          .from('course_tees')
          .insert({
            course_id: courseId,
            tee_id: teeData.tee_id,
            name: teeData.name,
            color: teeData.color,
            gender: teeData.gender,
            rating: teeData.rating,
            slope: teeData.slope,
            par: totalPar,
            yards: totalYards,
          })
          .select()
          .single();

        if (teeError) throw teeError;

        // Insert holes
        const holesToInsert = holes.map(hole => ({
          tee_id: newTee.id,
          hole_number: hole.hole_number,
          par: hole.par,
          yards: hole.yards,
          handicap: hole.handicap,
        }));

        const { error: holesError } = await supabase
          .from('course_holes')
          .insert(holesToInsert);

        if (holesError) throw holesError;

        toast.success('Tee created successfully');
      }

      onBack();
    } catch (error) {
      console.error('Error saving tee:', error);
      toast.error('Failed to save tee');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTee = async () => {
    if (!tee?.id) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('course_tees')
        .delete()
        .eq('id', tee.id);

      if (error) throw error;
      toast.success('Tee deleted successfully');
      onBack();
    } catch (error) {
      console.error('Error deleting tee:', error);
      toast.error('Failed to delete tee');
    } finally {
      setLoading(false);
    }
  };

  const updateHole = (index: number, field: keyof HoleData, value: any) => {
    const newHoles = [...holes];
    newHoles[index] = { ...newHoles[index], [field]: value };
    setHoles(newHoles);
  };

  const handleHoleCountChange = (count: string) => {
    const newCount = parseInt(count) as 9 | 18;
    setHoleCount(newCount);
    
    if (newCount > holes.length) {
      // Add more holes
      const additionalHoles = Array.from(
        { length: newCount - holes.length },
        (_, i) => ({
          hole_number: holes.length + i + 1,
          par: 4,
          yards: null,
          handicap: holes.length + i + 1,
        })
      );
      setHoles([...holes, ...additionalHoles]);
    } else if (newCount < holes.length) {
      // Remove extra holes
      setHoles(holes.slice(0, newCount));
    }
  };

  const { totalPar, totalYards } = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>
        {tee && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Tee
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this tee and all associated hole data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteTee}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tee ? 'Edit Tee' : 'Add New Tee'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tee Name *</Label>
              <Input
                id="name"
                value={teeData.name}
                onChange={(e) => setTeeData({ ...teeData, name: e.target.value })}
                placeholder="e.g., Championship, Men's, Ladies"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={teeData.color || ''}
                onChange={(e) => setTeeData({ ...teeData, color: e.target.value })}
                placeholder="e.g., White, Blue, Red"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Course Rating *</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                value={teeData.rating || ''}
                onChange={(e) => setTeeData({ ...teeData, rating: parseFloat(e.target.value) || null })}
                placeholder="72.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slope">Slope Rating *</Label>
              <Input
                id="slope"
                type="number"
                value={teeData.slope || ''}
                onChange={(e) => setTeeData({ ...teeData, slope: parseInt(e.target.value) || null })}
                placeholder="113"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Input
                id="gender"
                value={teeData.gender || ''}
                onChange={(e) => setTeeData({ ...teeData, gender: e.target.value })}
                placeholder="M/F"
              />
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium">Calculated Totals</p>
            <p className="text-sm text-muted-foreground">Par: {totalPar} | Yards: {totalYards}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Hole-by-Hole Details</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="hole-count" className="text-sm">Number of Holes:</Label>
              <Select value={holeCount.toString()} onValueChange={handleHoleCountChange}>
                <SelectTrigger id="hole-count" className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9">9</SelectItem>
                  <SelectItem value="18">18</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Hole</th>
                  <th className="text-left p-2">Par</th>
                  <th className="text-left p-2">Yards</th>
                  <th className="text-left p-2">Handicap</th>
                </tr>
              </thead>
              <tbody>
                {holes.map((hole, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{hole.hole_number}</td>
                    <td className="p-2">
                      <Input
                        type="number"
                        value={hole.par}
                        onChange={(e) => updateHole(index, 'par', parseInt(e.target.value) || 3)}
                        className="w-20"
                        min="3"
                        max="6"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        value={hole.yards || ''}
                        onChange={(e) => updateHole(index, 'yards', parseInt(e.target.value) || null)}
                        className="w-24"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        value={hole.handicap || ''}
                        onChange={(e) => updateHole(index, 'handicap', parseInt(e.target.value) || null)}
                        className="w-20"
                        min="1"
                        max="18"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <Button onClick={handleSaveTee} disabled={loading || !teeData.name}>
              <Save className="h-4 w-4 mr-2" />
              {tee ? 'Update Tee' : 'Create Tee'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
