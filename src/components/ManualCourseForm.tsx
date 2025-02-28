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
import { Loader2 } from "lucide-react";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatCourseName } from "@/integrations/supabase/client";

// Import our newly created components
import { CourseInformation } from "./course-form/CourseInformation";
import { TeeSelection } from "./course-form/TeeSelection";
import { TeeConfiguration } from "./course-form/TeeConfiguration";
import { HoleInputs } from "./course-form/HoleInputs";
import { TeeSummary } from "./course-form/TeeSummary";
import { createDefaultTee } from "./course-form/course-utils";
import { 
  ManualCourseFormProps, 
  ManualCourseData,
  TeeData,
  HoleData
} from "./course-form/types";

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
  
  // Import necessary components for types
  const { teeOptions } = require('./course-form/types');

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
          <CourseInformation 
            formData={formData}
            handleInputChange={handleInputChange}
            isEditMode={isEditMode}
          />
          
          {/* Tee Selection */}
          <TeeSelection 
            tees={formData.tees}
            currentTeeIndex={currentTeeIndex}
            setCurrentTeeIndex={setCurrentTeeIndex}
            handleAddTee={handleAddTee}
            handleRemoveTee={handleRemoveTee}
          />
          
          {/* Current Tee Details */}
          {formData.tees.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <TeeConfiguration 
                currentTee={formData.tees[currentTeeIndex]} 
                handleTeeChange={(teeName) => handleTeeChange(currentTeeIndex, teeName)}
              />
              
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="front9">Front Nine</TabsTrigger>
                  <TabsTrigger value="back9">Back Nine</TabsTrigger>
                </TabsList>
                <TabsContent value="front9">
                  <HoleInputs 
                    holes={formData.tees[currentTeeIndex].holes.slice(0, 9)}
                    handleHoleChange={(holeIndex, field, value) => 
                      handleHoleChange(currentTeeIndex, holeIndex, field, value)
                    }
                  />
                </TabsContent>
                <TabsContent value="back9">
                  <HoleInputs 
                    holes={formData.tees[currentTeeIndex].holes.slice(9, 18)}
                    handleHoleChange={(holeIndex, field, value) => 
                      handleHoleChange(currentTeeIndex, holeIndex + 9, field, value)
                    }
                  />
                </TabsContent>
              </Tabs>
              
              <TeeSummary currentTee={formData.tees[currentTeeIndex]} />
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
