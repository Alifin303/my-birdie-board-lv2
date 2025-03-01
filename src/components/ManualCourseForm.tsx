
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const formSchema = z.object({
  courseName: z.string().min(3, { message: "Course name must be at least 3 characters" }),
  city: z.string().optional(),
  state: z.string().optional(),
});

interface ManualCourseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCourseCreated?: (courseId: number, courseName: string) => void;
  initialCourseName?: string;
}

export function ManualCourseForm({ open, onOpenChange, onCourseCreated, initialCourseName = "" }: ManualCourseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseName: initialCourseName,
      city: "",
      state: "",
    },
  });

  // Update form value when initialCourseName changes
  useEffect(() => {
    if (initialCourseName) {
      console.log("Setting initial course name:", initialCourseName);
      form.setValue("courseName", initialCourseName);
    }
  }, [initialCourseName, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    console.log("Submitting course form with values:", values);

    try {
      // Insert the course into the database
      const { data, error } = await supabase
        .from("courses")
        .insert({
          name: values.courseName,
          city: values.city || null,
          state: values.state || null,
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
        
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="Enter city" {...field} />
              </FormControl>
              <FormDescription>
                Enter the city where the course is located.
              </FormDescription>
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
              <FormDescription>
                Enter the state where the course is located.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
