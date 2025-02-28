import { useState, useRef } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/use-toast";

const today = new Date();

interface AddRoundModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  courses: { id: string; name: string }[];
  onAddRound: (roundData: any) => void;
}

export function AddRoundModal({ open, setOpen, courses, onAddRound }: AddRoundModalProps) {
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>(undefined);
  const [roundDate, setRoundDate] = useState<Date>(today);
  const [scores, setScores] = useState<number[]>(Array(18).fill(0));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarContainerRef = useRef(null);

  // Handle date selection with improved behavior and debugging
  const handleDateSelect = (date: Date | undefined) => {
    console.log("Date selection triggered:", date);
    
    if (!date) {
      console.log("No date selected or date is undefined");
      return;
    }
    
    // Check if the selected date is in the future
    const isDateInFuture = date > today;
    console.log("Selected date:", date, "Today:", today, "Is future date:", isDateInFuture);
    
    if (isDateInFuture) {
      console.log("Future date detected, showing error toast");
      toast({
        title: "Invalid Date",
        description: "You cannot select a future date",
        variant: "destructive",
      });
      return;
    }
    
    // Valid date selected
    console.log("Valid date selected, updating state:", date);
    setRoundDate(date);
    
    // Force close the popover after successful selection
    console.log("Closing calendar popover");
    setCalendarOpen(false);
  };

  const handleScoreChange = (index: number, value: number) => {
    const newScores = [...scores];
    newScores[index] = value;
    setScores(newScores);
  };

  const handleSubmit = () => {
    if (!selectedCourse) {
      toast({
        title: "Missing Course",
        description: "Please select a course",
        variant: "destructive",
      });
      return;
    }

    const roundData = {
      courseId: selectedCourse,
      date: roundDate,
      scores: scores.filter(score => score > 0),
    };

    onAddRound(roundData);
    setOpen(false);
  };

  // Render scorecard with front 9 and back 9 layout
  const renderScorecard = () => {
    if (!selectedCourse) return null;
    
    // Get front 9 and back 9 holes
    const frontNine = scores.length <= 9 ? scores : scores.slice(0, 9);
    const backNine = scores.length <= 9 ? [] : scores.slice(9, 18);
    
    return (
      <div className="space-y-6 scorecard-container">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="relative">
            <p className="text-sm font-medium text-muted-foreground">Round Date</p>
            <Popover 
              open={calendarOpen} 
              onOpenChange={(isOpen) => {
                console.log("Popover state changing to:", isOpen);
                setCalendarOpen(isOpen);
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="mt-1"
                  onClick={(e) => {
                    e.stopPropagation(); 
                    console.log("Date button clicked, opening calendar");
                    setCalendarOpen(true);
                  }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(roundDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-auto p-0 bg-white shadow-xl border border-border z-[9999]" 
                align="start"
                onEscapeKeyDown={(e) => {
                  console.log("Escape key pressed in popover");
                  e.preventDefault(); // Prevent default escape behavior
                  setCalendarOpen(false); // Manually close the popover
                }}
                onPointerDownOutside={(e) => {
                  console.log("Pointer down outside popover");
                  e.preventDefault(); // Prevent closing on outside click
                }}
                onFocusOutside={(e) => {
                  console.log("Focus outside popover");
                  e.preventDefault(); // Prevent closing on outside focus
                }}
                onClick={(e) => {
                  console.log("Clicked inside PopoverContent");
                  e.stopPropagation(); // Prevent propagation
                }}
                style={{ pointerEvents: 'auto' }}
              >
                <div 
                  ref={calendarContainerRef}
                  className="isolate pointer-events-auto" 
                  style={{ 
                    pointerEvents: 'auto', 
                    cursor: 'auto',
                    position: 'relative',
                    zIndex: 9999
                  }}
                  onClick={(e) => {
                    console.log("Calendar container clicked");
                    e.stopPropagation();
                  }}
                >
                  <Calendar
                    mode="single"
                    selected={roundDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    defaultMonth={roundDate}
                    fromYear={2000}
                    toYear={today.getFullYear()}
                    disabled={(date) => {
                      // Disable future dates
                      return date > today;
                    }}
                    modifiersStyles={{
                      selected: {
                        backgroundColor: "#ffffff",
                        color: "#333333",
                        border: "2px solid hsl(142 35% 23%)",
                        fontWeight: "bold"
                      },
                      today: {
                        backgroundColor: "#f1f1f1",
                        color: "#333333",
                        fontWeight: "500"
                      }
                    }}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <Select onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Front 9</h3>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={`front-${i}`} className="flex flex-col">
                  <Label htmlFor={`hole-${i + 1}`} className="text-sm">Hole {i + 1}</Label>
                  <Input
                    type="number"
                    id={`hole-${i + 1}`}
                    min="0"
                    max="10"
                    value={scores[i] || ''}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      handleScoreChange(i, isNaN(value) ? 0 : value);
                    }}
                    className="w-20"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Back 9</h3>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={`back-${i}`} className="flex flex-col">
                  <Label htmlFor={`hole-${i + 10}`} className="text-sm">Hole {i + 10}</Label>
                  <Input
                    type="number"
                    id={`hole-${i + 10}`}
                    min="0"
                    max="10"
                    value={scores[i + 9] || ''}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      handleScoreChange(i + 9, isNaN(value) ? 0 : value);
                    }}
                    className="w-20"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "block" : "hidden"}`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <h3
                className="text-base font-semibold leading-6 text-gray-900"
                id="modal-title"
              >
                Add New Round
              </h3>
              <div className="mt-4">
                {renderScorecard()}
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <Button className="bg-green-600 text-white" onClick={handleSubmit}>
                Submit
              </Button>
              <Button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
