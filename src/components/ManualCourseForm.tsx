import React, { useState, useEffect, useRef, ReactNode } from "react";
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
import { saveCourseTeesToDatabase, deleteCourseTees } from "@/integrations/supabase/course/course-db-operations";

import { CourseInformation } from "./course-form/CourseInformation";
import { TeeSelection } from "./course-form/TeeSelection";
import { TeeConfiguration } from "./course-form/TeeConfiguration";
import { HoleInputs } from "./course-form/HoleInputs";
import { TeeSummary } from "./course-form/TeeSummary";
import { createDefaultTee, calculateRatings } from "./course-form/course-utils";
import { 
  ManualCourseFormProps, 
  ManualCourseData,
  TeeData,
  HoleData,
  teeOptions
} from "./course-form/types";

export function ManualCourseForm({ 
  open, 
  onOpenChange, 
  onCourseCreated,
  existingCourse 
}: ManualCourseFormProps) {
  const [formData, setFormData] = useState<ManualCourseData>(() => {
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
  const manualCourseFormRef = useRef(null);

  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      console.log("ManualCourseForm opened, existingCourse:", existingCourse);
      if (existingCourse) {
        console.log("Loading existing course data:", existingCourse);
        setIsEditMode(true);
        
        const loadTeeData = async () => {
          try {
            const { data: courseTees, error } = await supabase
              .from('course_tees')
              .select('*')
              .eq('course_id', existingCourse.id);
              
            if (error) {
              console.error("Error fetching tees from database:", error);
              loadFromLocalStorage();
              return;
            }
            
            if (courseTees && courseTees.length > 0) {
              const teesWithHoles: TeeData[] = [];
              
              for (const tee of courseTees) {
                const { data: holes, error: holesError } = await supabase
                  .from('course_holes')
                  .select('*')
                  .eq('tee_id', tee.id)
                  .order('hole_number', { ascending: true });
                  
                if (holesError) {
                  console.error("Error fetching holes for tee:", tee.id, holesError);
                  continue;
                }
                
                const formattedHoles: HoleData[] = [];
                for (let i = 1; i <= 18; i++) {
                  const hole = holes?.find(h => h.hole_number === i);
                  formattedHoles.push({
                    number: i,
                    par: hole?.par || 4,
                    yards: hole?.yards || 350,
                    handicap: hole?.handicap || i
                  });
                }
                
                teesWithHoles.push({
                  id: tee.tee_id,
                  name: tee.name,
                  color: tee.color || '#FFFFFF',
                  gender: tee.gender as 'male' | 'female' || 'male',
                  holes: formattedHoles
                });
              }
              
              if (teesWithHoles.length > 0) {
                setFormData({
                  name: existingCourse.name.replace(' [User added course]', ''),
                  city: existingCourse.city || '',
                  state: existingCourse.state || '',
                  tees: teesWithHoles
                });
                setCurrentTeeIndex(0);
                return;
              }
            }
            
            loadFromLocalStorage();
          } catch (error) {
            console.error("Error loading course tees from database:", error);
            loadFromLocalStorage();
          }
        };
        
        const loadFromLocalStorage = () => {
          const courseDetailsKey = `course_details_${existingCourse.id}`;
          const storedDetails = localStorage.getItem(courseDetailsKey);
          
          if (storedDetails) {
            try {
              const parsedDetails = JSON.parse(storedDetails);
              console.log("Found stored course details:", parsedDetails);
              
              const tees = parsedDetails.tees || [createDefaultTee()];
              
              setFormData({
                name: existingCourse.name.replace(' [User added course]', ''),
                city: existingCourse.city || '',
                state: existingCourse.state || '',
                tees: tees
              });
              
              if (tees.length > 0) {
                setCurrentTeeIndex(0);
              }
            } catch (error) {
              console.error("Error parsing stored course details:", error);
              
              setFormData({
                name: existingCourse.name.replace(' [User added course]', ''),
                city: existingCourse.city || '',
                state: existingCourse.state || '',
                tees: [createDefaultTee()]
              });
            }
          } else {
            console.log("No stored details found for course:", existingCourse.id);
            
            setFormData({
              name: existingCourse.name.replace(' [User added course]', ''),
              city: existingCourse.city || '',
              state: existingCourse.state || '',
              tees: [createDefaultTee()]
            });
          }
        };
        
        loadTeeData();
      } else {
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
  
  const handleInputChange = (field: keyof ManualCourseData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleTeeChange = (teeName: string) => {
    const selectedTee = teeOptions.find(t => t.name === teeName);
    
    if (!selectedTee) return;
    
    setFormData(prev => {
      const updatedTees = [...prev.tees];
      updatedTees[currentTeeIndex] = {
        ...updatedTees[currentTeeIndex],
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
  
  const handleHoleChange = (
    holeIndex: number,
    field: keyof HoleData,
    value: string
  ) => {
    let numValue: number;
    
    if (value === '') {
      if (field === 'par') {
        numValue = 4;
      } else if (field === 'yards') {
        numValue = 0;
      } else if (field === 'handicap') {
        numValue = holeIndex + 1;
      } else {
        return;
      }
    } else {
      numValue = parseInt(value);
      if (isNaN(numValue)) return;
    }
    
    setFormData(prev => {
      const updatedTees = [...prev.tees];
      const updatedHoles = [...updatedTees[currentTeeIndex].holes];
      
      const actualHoleIndex = currentTab === 'back9' ? holeIndex + 9 : holeIndex;
      
      updatedHoles[actualHoleIndex] = {
        ...updatedHoles[actualHoleIndex],
        [field]: numValue
      };
      
      updatedTees[currentTeeIndex] = {
        ...updatedTees[currentTeeIndex],
        holes: updatedHoles
      };
      
      return {
        ...prev,
        tees: updatedTees
      };
    });
  };
  
  const handleAddTee = () => {
    setFormData(prev => ({
      ...prev,
      tees: [...prev.tees, createDefaultTee()]
    }));
    
    setCurrentTeeIndex(formData.tees.length);
  };
  
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
    
    if (currentTeeIndex >= teeIndex && currentTeeIndex > 0) {
      setCurrentTeeIndex(currentTeeIndex - 1);
    }
  };
  
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
    
    for (let teeIndex = 0; teeIndex < formData.tees.length; teeIndex++) {
      const tee = formData.tees[teeIndex];
      
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
  
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      console.log("Saving course with data:", formData);
      
      const userAddedName = formData.name + " [User added course]";
      const formattedName = formatCourseName(userAddedName);
      
      const courseData = {
        name: formattedName,
        city: formData.city,
        state: formData.state,
        api_course_id: null
      };
      
      let courseId: number;
      
      if (existingCourse?.id) {
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
        
        await deleteCourseTees(courseId);
      } else {
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
      
      const preparedTees = formData.tees.map(tee => {
        const { rating, slope, par, yards } = calculateRatings(tee);
        return {
          ...tee,
          rating,
          slope,
          par,
          yards
        };
      });
      
      const saveResult = await saveCourseTeesToDatabase(courseId, preparedTees);
      
      if (!saveResult) {
        console.warn("Failed to save tees to database, falling back to localStorage");
      }
      
      const courseDetailsKey = `course_details_${courseId}`;
      const courseDetails = {
        id: courseId,
        name: formData.name,
        clubName: formData.name,
        city: formData.city,
        state: formData.state,
        isUserAdded: true,
        tees: preparedTees,
        holes: preparedTees[0]?.holes || []
      };
      
      localStorage.setItem(courseDetailsKey, JSON.stringify(courseDetails));
      console.log("Saved course details to localStorage:", courseDetailsKey, courseDetails);
      
      const metadataKey = `golf_course_${courseId}`;
      const courseMetadata = {
        id: courseId,
        name: formData.name,
        clubName: formData.name,
        city: formData.city,
        state: formData.state,
        tees: preparedTees,
        holes: preparedTees[0]?.holes || []
      };
      
      localStorage.setItem(metadataKey, JSON.stringify(courseMetadata));
      console.log("Saved course metadata to localStorage:", metadataKey, courseMetadata);
      
      toast({
        title: existingCourse ? "Course Updated" : "Course Created",
        description: existingCourse ? 
          "The course has been successfully updated." : 
          "The course has been successfully created.",
      });
      
      onCourseCreated(courseId, formattedName);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      return false;
    }
    return true;
  };

  React.useImperativeHandle(manualCourseFormRef, () => ({
    setExistingCourse: (course: any) => {
      console.log("Setting existing course via ref:", course);
      if (course) {
        setIsEditMode(true);
        
        const courseDetailsKey = `course_details_${course.id}`;
        const storedDetails = localStorage.getItem(courseDetailsKey);
        
        if (storedDetails) {
          try {
            const parsedDetails = JSON.parse(storedDetails);
            console.log("Found stored course details:", parsedDetails);
            
            const tees = parsedDetails.tees || [createDefaultTee()];
            
            setFormData({
              name: course.name.replace(' [User added course]', ''),
              city: course.city || '',
              state: course.state || '',
              tees: tees
            });
            
            if (tees.length > 0) {
              setCurrentTeeIndex(0);
            }
          } catch (error) {
            console.error("Error parsing stored course details:", error);
            
            setFormData({
              name: course.name.replace(' [User added course]', ''),
              city: course.city || '',
              state: course.state || '',
              tees: [createDefaultTee()]
            });
          }
        } else {
          console.log("No stored details found for course:", course.id);
          
          setFormData({
            name: course.name.replace(' [User added course]', ''),
            city: course.city || '',
            state: course.state || '',
            tees: [createDefaultTee()]
          });
        }
      }
    }
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-5xl max-h-[90vh] overflow-y-auto p-3 sm:p-6"
        onKeyDown={handleKeyDown}
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
        
        <form 
          className="space-y-6" 
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}
        >
          <CourseInformation 
            formData={formData}
            handleInputChange={handleInputChange}
            isEditMode={isEditMode}
          />
          
          <TeeSelection 
            tees={formData.tees}
            currentTeeIndex={currentTeeIndex}
            setCurrentTeeIndex={setCurrentTeeIndex}
            handleAddTee={handleAddTee}
            handleRemoveTee={handleRemoveTee}
          />
          
          {formData.tees.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <TeeConfiguration 
                currentTee={formData.tees[currentTeeIndex]} 
                handleTeeChange={handleTeeChange}
              />
              
              <div className="md:block hidden">
                <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="front9" type="button">Front Nine</TabsTrigger>
                    <TabsTrigger value="back9" type="button">Back Nine</TabsTrigger>
                  </TabsList>
                  <TabsContent value="front9">
                    <HoleInputs 
                      holes={formData.tees[currentTeeIndex].holes.slice(0, 9)}
                      handleHoleChange={(holeIndex, field, value) => 
                        handleHoleChange(holeIndex, field, value)
                      }
                    />
                  </TabsContent>
                  <TabsContent value="back9">
                    <HoleInputs 
                      holes={formData.tees[currentTeeIndex].holes.slice(9, 18)}
                      handleHoleChange={(holeIndex, field, value) => 
                        handleHoleChange(holeIndex, field, value)
                      }
                    />
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="md:hidden block">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Front Nine</h3>
                  <HoleInputs 
                    holes={formData.tees[currentTeeIndex].holes.slice(0, 9)}
                    handleHoleChange={(holeIndex, field, value) => 
                      handleHoleChange(holeIndex, field, value)
                    }
                  />
                </div>
                
                <div className="space-y-2 mt-6">
                  <h3 className="text-sm font-medium">Back Nine</h3>
                  <HoleInputs 
                    holes={formData.tees[currentTeeIndex].holes.slice(9, 18)}
                    handleHoleChange={(holeIndex, field, value) => 
                      handleHoleChange(holeIndex + 9, field, value)
                    }
                  />
                </div>
              </div>
              
              <TeeSummary currentTee={formData.tees[currentTeeIndex]} />
            </div>
          )}
        
          <DialogFooter className="pt-2 sm:pt-0">
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              Cancel
            </Button>
            <Button 
              onClick={() => handleSubmit()}
              disabled={isLoading}
              type="submit"
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
