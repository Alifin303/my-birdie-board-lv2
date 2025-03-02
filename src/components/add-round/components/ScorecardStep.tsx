
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AddRoundStepProps } from "../types";

export const ScorecardStep = ({
  selectedCourse,
  selectedTeeId,
  selectedTee,
  scores,
  roundDate,
  isLoading,
  setStep,
  setSelectedTeeId,
  setSelectedTee,
  handleHoleScoreChange,
  handleSaveRound,
}: AddRoundStepProps) => {
  useEffect(() => {
    if (selectedCourse && (!selectedTeeId || !selectedTee)) {
      // If course is selected but no tee is selected, default to the first tee
      if (selectedCourse.tees && selectedCourse.tees.length > 0) {
        const firstTee = selectedCourse.tees[0];
        console.log("Auto-selecting first tee:", firstTee.name, firstTee.id);
        setSelectedTeeId(firstTee.id);
        setSelectedTee(firstTee);
      }
    }
  }, [selectedCourse, selectedTeeId, selectedTee, setSelectedTeeId, setSelectedTee]);

  useEffect(() => {
    // When tee ID changes, update the selected tee object
    if (selectedCourse && selectedTeeId) {
      const newSelectedTee = selectedCourse.tees.find(
        (tee) => tee.id === selectedTeeId
      );
      
      console.log("Updating selected tee based on ID change:", {
        selectedTeeId, 
        foundTee: newSelectedTee?.name,
        allTees: selectedCourse.tees.map(t => ({ id: t.id, name: t.name }))
      });
      
      if (newSelectedTee) {
        setSelectedTee(newSelectedTee);
      } else {
        console.error("No tee found with ID:", selectedTeeId);
      }
    }
  }, [selectedTeeId, selectedCourse, setSelectedTee]);

  if (!selectedCourse) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">No course selected</p>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => setStep("search")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">Loading course information...</p>
      </div>
    );
  }

  console.log("Rendering ScorecardStep with:", { 
    course: selectedCourse.name, 
    teeId: selectedTeeId,
    teeName: selectedTee?.name,
    availableTees: selectedCourse.tees?.map(t => ({ id: t.id, name: t.name }))
  });

  const handleTeeChange = (teeId: string) => {
    console.log("Tee selection changed to ID:", teeId);
    console.log("Available tees:", selectedCourse.tees.map(t => ({ id: t.id, name: t.name })));
    
    const newSelectedTee = selectedCourse.tees.find(tee => tee.id === teeId);
    console.log("Found tee object:", newSelectedTee);
    
    if (newSelectedTee) {
      console.log("Setting new tee:", newSelectedTee.name);
      setSelectedTeeId(teeId);
      setSelectedTee(newSelectedTee);
    } else {
      console.error("Could not find tee with ID:", teeId);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">
            {selectedCourse.clubName} - {selectedCourse.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {selectedCourse.city}
            {selectedCourse.state ? `, ${selectedCourse.state}` : ""}
          </p>
          <p className="text-sm">
            Date: {roundDate ? formatDate(roundDate) : "No date selected"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep("search")}
          className="mt-0"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Change Course
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Tee Played</label>
          <Select 
            value={selectedTeeId || ""} 
            onValueChange={handleTeeChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a tee" />
            </SelectTrigger>
            <SelectContent>
              {selectedCourse.tees?.map((tee) => (
                <SelectItem key={tee.id} value={tee.id}>
                  {tee.name} - {tee.rating}/{tee.slope}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-background">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium">Enter Your Hole Scores</h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Enter your score for each hole.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <ScrollArea className="h-[300px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {scores.map((score, index) => (
              <div
                key={`hole-${score.hole}`}
                className="flex items-center space-x-2"
              >
                <div className="w-16 text-sm">
                  <span>Hole {score.hole}</span>
                </div>
                <div className="w-12 text-sm text-center">
                  <span className="text-muted-foreground">Par {score.par}</span>
                </div>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={20}
                  value={score.strokes || ""}
                  onChange={(e) =>
                    handleHoleScoreChange(index, e.target.value)
                  }
                  className="w-16 h-9"
                  required
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="pt-4 flex justify-end space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setStep("date")}
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSaveRound}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Round"}
        </Button>
      </div>
    </div>
  );
};
