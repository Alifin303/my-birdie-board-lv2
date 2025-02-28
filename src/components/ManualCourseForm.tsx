
import React, { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatCourseName } from "@/integrations/supabase/client";

// Define interface for tee data
interface TeeData {
  id: string;
  name: string;
  color: string;
  gender: 'male' | 'female';
  holes: HoleData[];
}

// Interface for hole data
interface HoleData {
  number: number;
  par: number;
  yards: number;
  handicap: number;
}

// Define interface for manual course data
interface ManualCourseData {
  name: string;
  city: string;
  state: string;
  tees: TeeData[];
}

// Available tee options with standard colors
const teeOptions = [
  { name: 'Black', color: '#000000', gender: 'male' },
  { name: 'Blue', color: '#0000FF', gender: 'male' },
  { name: 'White', color: '#FFFFFF', gender: 'male' },
  { name: 'Yellow', color: '#FFFF00', gender: 'male' },
  { name: 'Red', color: '#FF0000', gender: 'female' },
  { name: 'Green', color: '#008000', gender: 'female' },
  { name: 'Gold', color: '#FFD700', gender: 'male' },
  { name: 'Silver', color: '#C0C0C0', gender: 'female' },
];

interface ManualCourseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCourseCreated: (courseId: number, courseName: string) => void;
  existingCourse?: {
    id: number;
    name: string;
    city?: string;
    state?: string;
    tees?: TeeData[];
  };
}

export function ManualCourseForm({ 
  open, 
  onOpenChange, 
  onCourseCreated,
  existingCourse 
}: ManualCourseFormProps) {
  const [formData, setFormData] = useState<ManualCourseData>(() => {
    // Initialize with existing course data if provided, otherwise with defaults
    if (existingCourse) {
      return {
        name: existingCourse.name.replace(' [User added course]', ''),
        city: existingCourse.city || '',
        state: existingCourse.state || '',
        tees: existingCourse.tees || [createDefaultTee()]
      };
    }
    
    return {
      name: '',
      city: '',
      state: '',
      tees: [createDefaultTee()]
    };
  });
  
  const [currentTeeIndex, setCurrentTeeIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('front9');
  const [isEditMode, setIsEditMode] = useState(!!existingCourse);
  
  const { toast } = useToast();

  // Set initial state when form opens or when existingCourse changes
  useEffect(() => {
    if (open) {
      console.log("ManualCourseForm opened, existingCourse:", existingCourse);
      if (existingCourse) {
        console.log("Loading existing course data:", existingCourse);
        setIsEditMode(true);
        
        // Get the tees from localStorage if they exist
        const courseDetailsKey = `course_details_${existingCourse.id}`;
        const storedDetails = localStorage.getItem(courseDetailsKey);
        
        if (storedDetails) {
          try {
            const parsedDetails = JSON.parse(storedDetails);
            console.log("Found stored course details:", parsedDetails);
            
            // Use the stored tees or fallback to a default tee
            const tees = parsedDetails.tees || [createDefaultTee()];
            
            setFormData({
              name: existingCourse.name.replace(' [User added course]', ''),
              city: existingCourse.city || '',
              state: existingCourse.state || '',
              tees: tees
            });
            
            // Set the current tee to the first tee
            if (tees.length > 0) {
              setCurrentTeeIndex(0);
            }
          } catch (error) {
            console.error("Error parsing stored course details:", error);
            
            // Fallback to default data with the course name/city/state
            setFormData({
              name: existingCourse.name.replace(' [User added course]', ''),
              city: existingCourse.city || '',
              state: existingCourse.state || '',
              tees: [createDefaultTee()]
            });
          }
        } else {
          console.log("No stored details found for course:", existingCourse.id);
          
          // Fallback to default data with the course name/city/state
          setFormData({
            name: existingCourse.name.replace(' [User added course]', ''),
            city: existingCourse.city || '',
            state: existingCourse.state || '',
            tees: [createDefaultTee()]
          });
        }
      } else {
        // New course - use defaults
        setIsEditMode(false);
        setFormData({
          name: '',
          city: '',
          state: '',
          tees: [createDefaultTee()]
        });
        setCurrentTeeIndex(0);
      }
      
      setCurrentTab('front9');
    }
  }, [open, existingCourse]);
  
  // Create a default tee with 18 holes
  function createDefaultTee(): TeeData {
    return {
      id: `tee-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'White',
      color: '#FFFFFF',
      gender: 'male',
      holes: Array(18).fill(null).map((_, idx) => ({
        number: idx + 1,
        par: 4,
        yards: 350,
        handicap: idx + 1
      }))
    };
  }
  
  // Handle form field changes
  const handleInputChange = (field: keyof ManualCourseData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle tee name selection
  const handleTeeChange = (teeIndex: number, teeName: string) => {
    const selectedTee = teeOptions.find(t => t.name === teeName);
    
    if (!selectedTee) return;
    
    setFormData(prev => {
      const updatedTees = [...prev.tees];
      updatedTees[teeIndex] = {
        ...updatedTees[teeIndex],
        name: selectedTee.name,
        color: selectedTee.color,
        gender: selectedTee.gender as 'male' | 'female'
      };
      return {
        ...prev,
        tees: updatedTees
      };
    });
  };
  
  // Handle hole data changes
  const handleHoleChange = (
    teeIndex: number,
    holeIndex: number,
    field: keyof HoleData,
    value: string
  ) => {
    let numValue: number;
    
    // Handle empty input
    if (value === '') {
      if (field === 'par') {
        numValue = 4; // Default par value
      } else if (field === 'yards') {
        numValue = 0; // Allow zero yards
      } else if (field === 'handicap') {
        numValue = holeIndex + 1; // Default handicap is hole number
      } else {
        return; // Ignore other empty fields
      }
    } else {
      numValue = parseInt(value);
      if (isNaN(numValue)) return;
    }
    
    setFormData(prev => {
      const updatedTees = [...prev.tees];
      const updatedHoles = [...updatedTees[teeIndex].holes];
      
      updatedHoles[holeIndex] = {
        ...updatedHoles[holeIndex],
        [field]: numValue
      };
      
      updatedTees[teeIndex] = {
        ...updatedTees[teeIndex],
        holes: updatedHoles
      };
      
      return {
        ...prev,
        tees: updatedTees
      };
    });
  };
  
  // Add a new tee
  const handleAddTee = () => {
    setFormData(prev => ({
      ...prev,
      tees: [...prev.tees, createDefaultTee()]
    }));
    
    // Switch to the new tee
    setCurrentTeeIndex(formData.tees.length);
  };
  
  // Remove a tee
  const handleRemoveTee = (teeIndex: number) => {
    if (formData.tees.length <= 1) {
      toast({
        title: "Cannot Remove Tee",
        description: "A course must have at least one tee.",
        variant: "destructive",
      });
      return;
    }
    
    setFormData(prev => {
      const updatedTees = prev.tees.filter((_, idx) => idx !== teeIndex);
      return {
        ...prev,
        tees: updatedTees
      };
    });
    
    // Update current tee index if needed
    if (currentTeeIndex >= teeIndex && currentTeeIndex > 0) {
      setCurrentTeeIndex(currentTeeIndex - 1);
    }
  };
  
  // Calculate course rating and slope for a tee (simplified algorithm)
  const calculateRatings = (tee: TeeData) => {
    // This is a simplified algorithm - in reality, course ratings are much more complex
    const totalYards = tee.holes.reduce((sum, hole) => sum + hole.yards, 0);
    const totalPar = tee.holes.reduce((sum, hole) => sum + hole.par, 0);
    
    // Simulated rating based on total yards and par
    const rating = parseFloat(((totalYards / 100) * 0.56 + totalPar * 0.24).toFixed(1));
    
    // Simulated slope based on total yards
    const slope = Math.round(113 + (totalYards - 6000) * 0.05);
    
    return { rating, slope, par: totalPar, yards: totalYards };
  };
  
  // Validate the form before submission
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a course name.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.city.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a city.",
        variant: "destructive",
      });
      return false;
    }
    
    // Validate each tee
    for (let teeIndex = 0; teeIndex < formData.tees.length; teeIndex++) {
      const tee = formData.tees[teeIndex];
      
      // Validate each hole's par (must be between 2 and 6)
      for (let holeIndex = 0; holeIndex < tee.holes.length; holeIndex++) {
        const hole = tee.holes[holeIndex];
        
        if (hole.par < 2 || hole.par > 6) {
          toast({
            title: "Validation Error",
            description: `Hole ${hole.number} par should be between 2 and 6.`,
            variant: "destructive",
          });
          return false;
        }
      }
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      console.log("Saving course with data:", formData);
      
      // Add "[User added course]" to the course name
      const userAddedName = formData.name + " [User added course]";
      
      // Format course name for database
      const formattedName = formatCourseName(userAddedName, userAddedName);
      
      // Prepare course data for insertion
      const courseData = {
        name: formattedName,
        city: formData.city,
        state: formData.state,
        api_course_id: null
      };
      
      let courseId: number;
      
      if (existingCourse?.id) {
        // Update existing course
        const { data: updatedCourse, error: updateError } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', existingCourse.id)
          .select('id')
          .single();
          
        if (updateError) {
          throw updateError;
        }
        
        courseId = updatedCourse.id;
        console.log("Updated existing course:", courseId);
      } else {
        // Insert new course
        const { data: newCourse, error: insertError } = await supabase
          .from('courses')
          .insert(courseData)
          .select('id')
          .single();
          
        if (insertError) {
          throw insertError;
        }
        
        courseId = newCourse.id;
        console.log("Inserted new course:", courseId);
      }
      
      // Save tees and holes data to a custom table or as metadata
      // For now, we'll store this in localStorage for simplicity
      // In a full implementation, you would create additional tables for tees/holes
      const courseDetailsKey = `course_details_${courseId}`;
      const courseDetails = {
        id: courseId,
        name: formData.name,
        tees: formData.tees.map(tee => {
          const { rating, slope, par, yards } = calculateRatings(tee);
          return {
            ...tee,
            rating,
            slope,
            par,
            yards
          };
        })
      };
      
      localStorage.setItem(courseDetailsKey, JSON.stringify(courseDetails));
      console.log("Saved course details to localStorage:", courseDetailsKey, courseDetails);
      
      toast({
        title: existingCourse ? "Course Updated" : "Course Created",
        description: existingCourse ? 
          "The course has been successfully updated." : 
          "The course has been successfully created.",
      });
      
      // Call the callback with course id and name
      onCourseCreated(courseId, formattedName);
      
      // Close the form
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving course:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render hole input fields for the current tee
  const renderHoleInputs = (teeIndex: number, holeStart: number, holeEnd: number) => {
    const holes = formData.tees[teeIndex].holes.slice(holeStart, holeEnd);
    
    return (
      <div className="border rounded-md overflow-x-auto mt-4">
        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="text-sm font-medium text-muted-foreground px-2 py-2 text-left">Hole</th>
              {holes.map(hole => (
                <th key={`header-${hole.number}`} className="text-sm font-medium text-muted-foreground px-2 py-2 text-center">
                  {hole.number}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="text-sm font-medium text-muted-foreground px-2 py-2">Par</td>
              {holes.map((hole) => (
                <td key={`par-${hole.number}`} className="text-center px-2 py-2">
                  <Input
                    type="number"
                    min="2"
                    max="6"
                    value={hole.par}
                    onChange={(e) => handleHoleChange(teeIndex, hole.number - 1, 'par', e.target.value)}
                    className="w-12 h-8 text-center"
                    required
                  />
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="text-sm font-medium text-muted-foreground px-2 py-2">Yards</td>
              {holes.map((hole) => (
                <td key={`yards-${hole.number}`} className="text-center px-2 py-2">
                  <Input
                    type="number"
                    min="0"
                    max="999"
                    value={hole.yards}
                    onChange={(e) => handleHoleChange(teeIndex, hole.number - 1, 'yards', e.target.value)}
                    className="w-12 h-8 text-center"
                    required
                  />
                </td>
              ))}
            </tr>
            <tr>
              <td className="text-sm font-medium text-muted-foreground px-2 py-2">Handicap</td>
              {holes.map((hole) => (
                <td key={`handicap-${hole.number}`} className="text-center px-2 py-2">
                  <Input
                    type="number"
                    min="1"
                    max="18"
                    value={hole.handicap}
                    onChange={(e) => handleHoleChange(teeIndex, hole.number - 1, 'handicap', e.target.value)}
                    className="w-12 h-8 text-center"
                    required
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-5xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>{existingCourse ? "Edit Course" : "Add a New Course"}</DialogTitle>
          <DialogDescription>
            {existingCourse ? 
              "Update course details or add more tee boxes." : 
              "Enter course details to add it to our database."
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Course Information */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Course Name</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter course name"
                className="mt-1"
                required
                disabled={isEditMode} // Disable editing for existing courses
              />
              {isEditMode && (
                <p className="text-xs text-muted-foreground mt-1">
                  Course name cannot be changed after creation
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">City</label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter city"
                  className="mt-1"
                  required
                  disabled={isEditMode} // Disable editing for existing courses
                />
                {isEditMode && (
                  <p className="text-xs text-muted-foreground mt-1">
                    City cannot be changed after creation
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">State</label>
                <Input
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="Enter state (optional)"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          
          {/* Tee Selection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Tee Boxes</label>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleAddTee}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Tee
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tees.map((tee, index) => (
                <div key={tee.id} className="flex items-center">
                  <Button
                    variant={currentTeeIndex === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentTeeIndex(index)}
                    className="flex items-center gap-1"
                    style={{ 
                      borderColor: tee.color,
                      boxShadow: currentTeeIndex === index ? `0 0 0 1px ${tee.color}` : 'none'
                    }}
                  >
                    {tee.name}
                    
                    {formData.tees.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTee(index);
                        }}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Current Tee Details */}
          {formData.tees.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Configure {formData.tees[currentTeeIndex].name} Tee Box
                </label>
                
                <Select
                  value={formData.tees[currentTeeIndex].name}
                  onValueChange={(value) => handleTeeChange(currentTeeIndex, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tee color" />
                  </SelectTrigger>
                  <SelectContent>
                    {teeOptions.map((tee) => (
                      <SelectItem key={tee.name} value={tee.name}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: tee.color, border: tee.color === '#FFFFFF' ? '1px solid #ccc' : 'none' }} 
                          />
                          {tee.name} ({tee.gender === 'male' ? 'Men\'s' : 'Women\'s'})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <p className="text-xs text-muted-foreground mt-1">
                  The community benefits from having all relevant tees added — feel free to add more!
                </p>
              </div>
              
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="front9">Front Nine</TabsTrigger>
                  <TabsTrigger value="back9">Back Nine</TabsTrigger>
                </TabsList>
                <TabsContent value="front9">
                  {renderHoleInputs(currentTeeIndex, 0, 9)}
                </TabsContent>
                <TabsContent value="back9">
                  {renderHoleInputs(currentTeeIndex, 9, 18)}
                </TabsContent>
              </Tabs>
              
              <div className="border rounded-md p-4 bg-muted/30">
                <h3 className="text-sm font-medium mb-2">Tee Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {(() => {
                    const { rating, slope, par, yards } = calculateRatings(formData.tees[currentTeeIndex]);
                    return (
                      <>
                        <div><span className="font-medium">Total Par:</span> {par}</div>
                        <div><span className="font-medium">Total Yards:</span> {yards}</div>
                        <div><span className="font-medium">Course Rating:</span> {rating}</div>
                        <div><span className="font-medium">Slope Rating:</span> {slope}</div>
                      </>
                    );
                  })()}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Note: Course and slope ratings are automatically calculated based on the hole data.
                  These are approximate values and may differ from official ratings.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            type="button"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {existingCourse ? "Updating..." : "Creating..."}
              </>
            ) : (
              existingCourse ? "Update Course" : "Create Course"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
