
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScoreCard } from "@/components/ScoreCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimplifiedCourseDetail, Score, HoleSelection } from "../types";
import { useForm, FormProvider } from "react-hook-form";

interface ScorecardStepProps {
  selectedCourse: SimplifiedCourseDetail | null;
  selectedTeeId: string | null;
  scores: Score[];
  handleScoreChange: (holeIndex: number, field: keyof Score, value: number) => void;
  handleTeeChange: (teeId: string) => void;
  handleSaveRound: () => void;
  isSaving?: boolean;
  roundDate: Date | undefined;
  setRoundDate: (date: Date | undefined) => void;
  handleDateSelect: (date: Date | undefined) => void;
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  holeSelection: HoleSelection;
  handleHoleSelectionChange: (selection: HoleSelection) => void;
  activeScoreTab: "front9" | "back9";
  setActiveScoreTab: (tab: "front9" | "back9") => void;
  handleBackToSearch: () => void;
  handleCloseModal?: () => void;
  isLoading?: boolean;
  dataLoadingError?: string | null;
  today?: Date;
}

// Define a simple form values type for the scorecard form
interface ScorecardFormValues {
  date: Date | undefined;
  tee: string | undefined;
  holeSelection: HoleSelection;
}

export function ScorecardStep({
  selectedCourse,
  selectedTeeId,
  scores,
  handleScoreChange,
  handleTeeChange,
  handleSaveRound,
  isSaving,
  roundDate,
  setRoundDate,
  handleDateSelect,
  calendarOpen,
  setCalendarOpen,
  holeSelection,
  handleHoleSelectionChange,
  activeScoreTab,
  setActiveScoreTab,
  handleBackToSearch,
  handleCloseModal,
  isLoading,
  dataLoadingError,
  today
}: ScorecardStepProps) {
  // Initialize form with the current values
  const form = useForm<ScorecardFormValues>({
    defaultValues: {
      date: roundDate,
      tee: selectedTeeId || undefined,
      holeSelection: holeSelection
    }
  });

  // Update form values when props change
  useEffect(() => {
    form.reset({
      date: roundDate,
      tee: selectedTeeId || undefined,
      holeSelection: holeSelection
    });
  }, [roundDate, selectedTeeId, holeSelection, form]);

  const getTeeNameById = (teeId: string | null) => {
    if (!teeId || !selectedCourse) return null;
    
    const tee = selectedCourse.tees.find(t => t.id === teeId);
    return tee ? tee.name : null;
  };
  
  const selectedTee = selectedCourse?.tees?.find(t => t.id === selectedTeeId);

  useEffect(() => {
    console.log("ScorecardStep - selectedTeeId changed to:", selectedTeeId);
    console.log("Selected tee:", selectedTee);
    console.log("Available tees:", selectedCourse?.tees?.map(t => ({ id: t.id, name: t.name })));
    
    if (!selectedTee && selectedCourse && selectedCourse.tees && selectedCourse.tees.length > 0) {
      console.warn("Selected tee not found but course has tees available");
    }
  }, [selectedTeeId, selectedTee, selectedCourse]);

  // Error state display for debugging
  if (!selectedCourse) {
    console.error("ScorecardStep rendered with no selectedCourse");
    return (
      <div className="p-4 border border-destructive rounded-md text-destructive">
        <h3 className="font-semibold mb-2">Error: No Course Selected</h3>
        <p>Please go back and select a course.</p>
        <Button 
          variant="outline"
          className="mt-4" 
          onClick={handleBackToSearch}
        >
          Back to Search
        </Button>
      </div>
    );
  }

  if (!selectedCourse.tees || selectedCourse.tees.length === 0) {
    console.error("Selected course has no tees:", selectedCourse);
    return (
      <div className="p-4 border border-destructive rounded-md text-destructive">
        <h3 className="font-semibold mb-2">Error: No Tees Available</h3>
        <p>The selected course does not have any tee boxes defined.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={handleBackToSearch}
        >
          Back to Search
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Loading course data...</p>
      </div>
    );
  }

  if (dataLoadingError) {
    return (
      <div className="p-4 border border-destructive rounded-md text-destructive">
        <h3 className="font-semibold mb-2">Error Loading Course Data</h3>
        <p>{dataLoadingError}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={handleBackToSearch}
        >
          Back to Search
        </Button>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <div className="space-y-8">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold">
            {selectedCourse.clubName}
            {selectedCourse.clubName !== selectedCourse.name && 
              ` - ${selectedCourse.name}`}
          </h3>
          <p className="text-sm text-muted-foreground">
            {selectedCourse.city}, {selectedCourse.state}
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Round Date</FormLabel>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !roundDate && "text-muted-foreground"
                          )}
                        >
                          {roundDate ? (
                            format(roundDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={roundDate}
                        onSelect={handleDateSelect}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tee"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tee Box</FormLabel>
                  <Select 
                    value={selectedTeeId || undefined} 
                    onValueChange={(value) => {
                      console.log("Selected tee before change:", selectedTee?.name);
                      console.log("New tee ID selected:", value);
                      handleTeeChange(value);
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select a tee box">
                        {selectedTee && (
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ 
                                backgroundColor: selectedTee.color || getTeeColor(selectedTee.name),
                                border: (selectedTee.color === '#FFFFFF' || getTeeColor(selectedTee.name) === '#FFFFFF') ? '1px solid #ccc' : 'none'
                              }} 
                            />
                            {selectedTee.name} ({selectedTee.gender === 'male' ? 'Men\'s' : 'Women\'s'})
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCourse.tees.map((tee) => (
                        <SelectItem key={tee.id} value={tee.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ 
                                backgroundColor: tee.color || getTeeColor(tee.name),
                                border: (tee.color === '#FFFFFF' || getTeeColor(tee.name) === '#FFFFFF') ? '1px solid #ccc' : 'none'
                              }} 
                            />
                            {tee.name} ({tee.gender === 'male' ? 'Men\'s' : 'Women\'s'})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="holeSelection"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Holes Played</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={holeSelection}
                    onValueChange={(value) => 
                      handleHoleSelectionChange(value as HoleSelection)
                    }
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="all" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        All 18 Holes
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="front9" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Front 9
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="back9" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Back 9
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />

          <Card className="p-4">
            {selectedTee && scores.length > 0 ? (
              <>
                {holeSelection === 'all' ? (
                  <Tabs 
                    defaultValue="front9" 
                    value={activeScoreTab} 
                    onValueChange={(value) => setActiveScoreTab(value as "front9" | "back9")}
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="front9">Front 9</TabsTrigger>
                      <TabsTrigger value="back9">Back 9</TabsTrigger>
                    </TabsList>
                    <TabsContent value="front9" className="mt-4">
                      <ScoreCard
                        holes={scores.slice(0, 9)}
                        onChange={handleScoreChange}
                        startIndex={0}
                        courseName={undefined}
                      />
                    </TabsContent>
                    <TabsContent value="back9" className="mt-4">
                      <ScoreCard
                        holes={scores.slice(9, 18)}
                        onChange={handleScoreChange}
                        startIndex={9}
                        courseName={undefined}
                      />
                    </TabsContent>
                  </Tabs>
                ) : (
                  <ScoreCard
                    holes={
                      holeSelection === "front9"
                        ? scores.slice(0, 9)
                        : scores.slice(9, 18)
                    }
                    onChange={handleScoreChange}
                    startIndex={holeSelection === "front9" ? 0 : 9}
                    courseName={undefined}
                  />
                )}
              </>
            ) : (
              <div className="h-40 flex items-center justify-center">
                <p className="text-muted-foreground">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading course data...
                    </span>
                  ) : !selectedTee ? (
                    "Select a tee to see the scorecard"
                  ) : (
                    "No scorecard data available"
                  )}
                </p>
              </div>
            )}
          </Card>

          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handleBackToSearch}
            >
              Back to Search
            </Button>
            <Button 
              onClick={handleSaveRound} 
              disabled={isSaving || !roundDate || !selectedTee || scores.length === 0}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Round"
              )}
            </Button>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}

function getTeeColor(teeName: string): string {
  const colorMap: Record<string, string> = {
    'White': '#FFFFFF',
    'Blue': '#0000FF',
    'Red': '#FF0000',
    'Gold': '#FFD700',
    'Black': '#000000',
    'Green': '#008000',
    'Yellow': '#FFFF00',
    'Silver': '#C0C0C0',
    'Copper': '#B87333',
    'Orange': '#FFA500',
    'Purple': '#800080'
  };
  
  const teeNameLower = teeName.toLowerCase();
  for (const [name, color] of Object.entries(colorMap)) {
    if (name.toLowerCase() === teeNameLower) {
      return color;
    }
  }
  
  return '#CCCCCC';
}
