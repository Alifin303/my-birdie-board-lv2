
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Plus, Trash } from "lucide-react";

const formSchema = z.object({
  courseName: z.string().min(3, { message: "Course name must be at least 3 characters" }),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});

interface TeeInfo {
  id: string;
  color: string;
  par: string;
  yards: string;
  slope: string;
  rating: string;
}

interface ManualCourseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCourseCreated?: (courseId: number, courseName: string) => void;
  initialCourseName?: string;
}

export function ManualCourseForm({ open, onOpenChange, onCourseCreated, initialCourseName = "" }: ManualCourseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tees, setTees] = useState<TeeInfo[]>([
    { id: "1", color: "", par: "", yards: "", slope: "", rating: "" }
  ]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseName: initialCourseName,
      city: "",
      state: "",
      country: "",
    },
  });

  // Update form value when initialCourseName changes
  useEffect(() => {
    if (initialCourseName) {
      console.log("Setting initial course name:", initialCourseName);
      form.setValue("courseName", initialCourseName);
    }
  }, [initialCourseName, form]);

  const addTee = () => {
    setTees([...tees, { 
      id: `tee-${Date.now()}`, 
      color: "", 
      par: "", 
      yards: "", 
      slope: "", 
      rating: "" 
    }]);
  };

  const removeTee = (id: string) => {
    if (tees.length > 1) {
      setTees(tees.filter(tee => tee.id !== id));
    } else {
      toast.error("You must have at least one tee");
    }
  };

  const updateTee = (id: string, field: keyof TeeInfo, value: string) => {
    setTees(tees.map(tee => 
      tee.id === id ? { ...tee, [field]: value } : tee
    ));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    console.log("Submitting course form with values:", values);
    console.log("Tee information:", tees);

    try {
      // Prepare tee information for database storage
      const teesData = tees.map(tee => ({
        color: tee.color,
        par: tee.par ? parseInt(tee.par) : null,
        yards: tee.yards ? parseInt(tee.yards) : null,
        slope: tee.slope ? parseInt(tee.slope) : null,
        rating: tee.rating ? parseFloat(tee.rating) : null
      }));

      // Insert the course into the database
      const { data, error } = await supabase
        .from("courses")
        .insert({
          name: values.courseName,
          city: values.city || null,
          state: values.state || null,
          tee_data: teesData.length > 0 ? teesData : null
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding course:", error);
        throw error;
      }

      console.log("Course added successfully:", data);
      // Show success message
      toast.success("Course added successfully!");

      // Call the callback function with the new course ID if provided
      if (onCourseCreated) {
        onCourseCreated(data.id, data.name);
      }

      // Reset form and close
      form.reset();
      setTees([{ id: "1", color: "", par: "", yards: "", slope: "", rating: "" }]);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error adding course:", error);
      toast.error(error.message || "Error adding course");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Course Information</h3>
            <p className="text-sm text-muted-foreground">
              Enter the basic information about the golf course
            </p>
          </div>
          
          <FormField
            control={form.control}
            name="courseName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter course name" {...field} />
                </FormControl>
                <FormDescription>
                  Enter the full name of the golf course.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter state" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter country" {...field} value={field.value || "USA"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Tees Information</h3>
            <p className="text-sm text-muted-foreground">
              Enter details about the tees available at this course
            </p>
          </div>
          
          {tees.map((tee, index) => (
            <Card key={tee.id} className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Tee Set {index + 1}</h4>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeTee(tee.id)}
                  disabled={tees.length <= 1}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <FormLabel htmlFor={`tee-color-${tee.id}`}>Tee Color</FormLabel>
                  <Input 
                    id={`tee-color-${tee.id}`}
                    placeholder="Blue, White, Red, etc."
                    value={tee.color}
                    onChange={(e) => updateTee(tee.id, 'color', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <FormLabel htmlFor={`tee-par-${tee.id}`}>Par</FormLabel>
                  <Input 
                    id={`tee-par-${tee.id}`}
                    placeholder="72"
                    type="number"
                    value={tee.par}
                    onChange={(e) => updateTee(tee.id, 'par', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <FormLabel htmlFor={`tee-yards-${tee.id}`}>Total Yards</FormLabel>
                  <Input 
                    id={`tee-yards-${tee.id}`}
                    placeholder="6500"
                    type="number"
                    value={tee.yards}
                    onChange={(e) => updateTee(tee.id, 'yards', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <FormLabel htmlFor={`tee-slope-${tee.id}`}>Slope Rating</FormLabel>
                  <Input 
                    id={`tee-slope-${tee.id}`}
                    placeholder="130"
                    type="number"
                    value={tee.slope}
                    onChange={(e) => updateTee(tee.id, 'slope', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <FormLabel htmlFor={`tee-rating-${tee.id}`}>Course Rating</FormLabel>
                  <Input 
                    id={`tee-rating-${tee.id}`}
                    placeholder="72.1"
                    type="number"
                    step="0.1"
                    value={tee.rating}
                    onChange={(e) => updateTee(tee.id, 'rating', e.target.value)}
                  />
                </div>
              </div>
            </Card>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addTee}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Tee Set
          </Button>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Save Course"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
