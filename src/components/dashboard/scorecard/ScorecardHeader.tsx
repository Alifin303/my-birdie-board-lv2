
import React from 'react';
import { format } from "date-fns";
import { Edit, Save, X, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScorecardHeaderProps } from "./types";

export const ScorecardHeader = ({
  round,
  isEditing,
  setIsEditing,
  roundDate,
  calendarOpen,
  setCalendarOpen,
  handleDateSelect,
  isSaving,
  handleSaveChanges
}: ScorecardHeaderProps) => {
  const formattedDate = roundDate 
    ? format(roundDate, 'MMMM d, yyyy')
    : format(new Date(round.date), 'MMMM d, yyyy');
    
  // IMPORTANT: Always use the exact tee_name saved in the round data
  const teeName = round.tee_name || "Standard";
  
  console.log("Displaying round with tee_name:", teeName, "tee_id:", round.tee_id);

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
        <div>
          <h3 className="font-semibold">Course Information</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {round.courses?.clubName} - {round.courses?.courseName}
          </p>
          <p className="text-sm text-muted-foreground">
            {round.courses?.city}{round.courses?.state ? `, ${round.courses?.state}` : ''}
          </p>
        </div>
        <div>
          <h3 className="font-semibold">Round Details</h3>
          {isEditing ? (
            <div className="space-y-2 mt-1">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {roundDate ? format(roundDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={roundDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mt-1">Date: {formattedDate}</p>
              <p className="text-sm text-muted-foreground">Tees: {teeName}</p>
            </>
          )}
        </div>
      </div>
      
      {/* Edit/Save buttons */}
      {isEditing ? (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(false)}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSaveChanges}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          onClick={() => setIsEditing(true)}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      )}
    </div>
  );
};
