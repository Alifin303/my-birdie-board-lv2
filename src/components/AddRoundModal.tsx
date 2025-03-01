
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { CourseSelector } from "./CourseSelector";
import { toast } from "sonner";
import { ManualCourseForm } from "./ManualCourseForm";

interface AddRoundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddRoundModal({ open, onOpenChange }: AddRoundModalProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'course-search' | 'round-details' | 'add-course'>('course-search');
  const [date, setDate] = useState<Date>(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [grossScore, setGrossScore] = useState<string>("");
  const [toPar, setToPar] = useState<string>("");
  const [tee, setTee] = useState<string>("");
  const [holeScores, setHoleScores] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noResultsFound, setNoResultsFound] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setStep('course-search');
    setDate(new Date());
    setSelectedCourse(null);
    setSearchTerm("");
    setGrossScore("");
    setToPar("");
    setTee("");
    setHoleScores("");
    setError(null);
    setNoResultsFound(false);
  };

  const handleCourseSelect = (course: any) => {
    console.log("Course selected:", course);
    setSelectedCourse(course);
    setNoResultsFound(false);
    setStep('round-details');
  };

  const handleBackToSearch = () => {
    setStep('course-search');
  };

  const handleAddMissingCourse = () => {
    console.log("Add missing course clicked. Search term:", searchTerm);
    setStep('add-course');
  };

  const handleCourseCreated = (courseId: number, courseName: string) => {
    // Create a course object that matches the expected format
    const newCourse = {
      id: courseId,
      name: courseName,
    };
    
    console.log("Course created:", newCourse);
    setSelectedCourse(newCourse);
    setStep('round-details');
    
    // Show success message
    toast.success(`"${courseName}" has been added successfully`);
  };

  const handleSearchUpdate = (term: string, hasResults: boolean) => {
    setSearchTerm(term);
    setNoResultsFound(!hasResults && term.length >= 3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate inputs
      if (!selectedCourse) {
        setError("Please select a course");
        setIsSubmitting(false);
        return;
      }

      if (!grossScore || isNaN(Number(grossScore))) {
        setError("Please enter a valid gross score");
        setIsSubmitting(false);
        return;
      }

      // Parse hole scores if provided
      let parsedHoleScores = null;
      if (holeScores) {
        try {
          // Check if it's a comma-separated list of numbers
          if (holeScores.includes(',')) {
            parsedHoleScores = holeScores.split(',').map(score => {
              const num = Number(score.trim());
              if (isNaN(num)) throw new Error("Invalid hole score");
              return num;
            });
          } else {
            // Try to parse as JSON
            parsedHoleScores = JSON.parse(holeScores);
          }
        } catch (err) {
          setError("Invalid hole scores format. Please use a comma-separated list (e.g., 4,5,3,4) or valid JSON.");
          setIsSubmitting(false);
          return;
        }
      }

      // Verify course exists by checking it one more time
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .eq('id', selectedCourse.id)
        .single();
        
      if (courseError || !courseData) {
        setError("Selected course does not exist in the database. Please select a valid course.");
        setIsSubmitting(false);
        return;
      }

      // Get the user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be logged in to add a round");
        setIsSubmitting(false);
        return;
      }

      // Prepare round data
      const roundData = {
        user_id: session.user.id,
        course_id: selectedCourse.id,
        date: date.toISOString(),
        gross_score: Number(grossScore),
        to_par_gross: toPar ? Number(toPar) : 0,
        tee_name: tee || null,
        hole_scores: parsedHoleScores
      };

      console.log("Submitting round data:", roundData);

      // Insert round
      const { data, error: insertError } = await supabase
        .from('rounds')
        .insert(roundData)
        .select();

      if (insertError) {
        console.error("Error inserting round:", insertError);
        if (insertError.message.includes("foreign key constraint")) {
          setError("The selected course does not exist. Please select a valid course.");
        } else {
          setError(insertError.message || "Failed to add round");
        }
        setIsSubmitting(false);
        return;
      }

      // Success
      console.log("Round added successfully:", data);
      queryClient.invalidateQueries({ queryKey: ['userRounds'] });
      toast.success("Round added successfully");
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error adding round:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Course search step content
  const renderCourseSearch = () => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="course">Search for a course</Label>
        <CourseSelector 
          selectedCourse={selectedCourse} 
          onCourseChange={handleCourseSelect}
          onAddMissingCourse={handleAddMissingCourse}
          onSearchUpdate={handleSearchUpdate}
          initialSearchTerm={searchTerm}
        />
      </div>
      
      {/* No Results Message */}
      {noResultsFound && (
        <div className="p-4 bg-muted rounded-md mt-2">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium">Course not found. Please check the name or add the course manually.</p>
              <Button 
                onClick={handleAddMissingCourse}
                variant="outline" 
                className="mt-3 w-full"
              >
                Can't find your course? Add it now: {searchTerm}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="text-destructive text-sm p-2 bg-destructive/10 rounded-md">
          {error}
        </div>
      )}
      
      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );

  // Round details step content
  const renderRoundDetails = () => (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {/* Selected Course Display */}
      <div className="p-3 bg-primary/10 rounded-md mb-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">{selectedCourse?.name}</p>
            <p className="text-sm text-muted-foreground">
              {selectedCourse?.city}{selectedCourse?.state ? `, ${selectedCourse?.state}` : ''}
            </p>
          </div>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToSearch}
          >
            Change Course
          </Button>
        </div>
      </div>

      {/* Date Picker */}
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                newDate && setDate(newDate);
                setDatePickerOpen(false);
              }}
              initialFocus
              disabled={(date) => date > new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Gross Score */}
      <div className="space-y-2">
        <Label htmlFor="grossScore">Gross Score</Label>
        <Input
          id="grossScore"
          type="number"
          value={grossScore}
          onChange={(e) => setGrossScore(e.target.value)}
          min="18"
          placeholder="Total score for the round"
          required
        />
      </div>

      {/* To Par */}
      <div className="space-y-2">
        <Label htmlFor="toPar">To Par</Label>
        <Input
          id="toPar"
          type="number"
          value={toPar}
          onChange={(e) => setToPar(e.target.value)}
          placeholder="Strokes relative to par (e.g., 5 for +5, -2 for 2 under)"
        />
      </div>

      {/* Tee */}
      <div className="space-y-2">
        <Label htmlFor="tee">Tee Played</Label>
        <Input
          id="tee"
          value={tee}
          onChange={(e) => setTee(e.target.value)}
          placeholder="E.g., Blue, White, Gold, etc."
        />
      </div>

      {/* Hole by hole scores (optional) */}
      <div className="space-y-2">
        <Label htmlFor="holeScores">
          Hole Scores (Optional)
        </Label>
        <Input
          id="holeScores"
          value={holeScores}
          onChange={(e) => setHoleScores(e.target.value)}
          placeholder="Comma-separated list, e.g., 4,5,3,4..."
        />
        <p className="text-xs text-muted-foreground">
          Enter scores as a comma-separated list (e.g., 4,5,3,4...)
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="text-destructive text-sm p-2 bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      {/* Submit button */}
      <div className="flex justify-end">
        <Button type="button" variant="outline" className="mr-2" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Round"}
        </Button>
      </div>
    </form>
  );

  // Add missing course step
  const renderAddCourse = () => (
    <div className="space-y-4 py-4">
      <ManualCourseForm 
        open={true}
        onOpenChange={(open) => {
          if (!open) {
            setStep('course-search');
          }
        }}
        onCourseCreated={handleCourseCreated}
        initialCourseName={searchTerm}
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Round</DialogTitle>
          <DialogDescription>
            {step === 'course-search' 
              ? "Search for the course you played at."
              : step === 'add-course'
              ? "Add a new course"
              : "Enter the details of your golf round."
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'course-search' && renderCourseSearch()}
        {step === 'round-details' && renderRoundDetails()}
        {step === 'add-course' && renderAddCourse()}
      </DialogContent>
    </Dialog>
  );
}
