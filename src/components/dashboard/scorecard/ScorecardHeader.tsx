
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Save, Edit, BarChart3 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
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
  handleSaveChanges,
  showDetailedStats,
  setShowDetailedStats,
  handicapIndex,
  isDemo = false
}: ScorecardHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-muted/30 rounded-lg">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">{round.courses?.name}</h3>
          {isDemo && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
              DEMO
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Date: {new Date(roundDate || round.date).toLocaleDateString()}</span>
          <span>Tee: {round.tee_name || 'Standard'}</span>
          <span>Handicap: {handicapIndex}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {!isDemo && setShowDetailedStats && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetailedStats(!showDetailedStats)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {showDetailedStats ? 'Basic' : 'Detailed'}
          </Button>
        )}
        
        {!isDemo && (
          <>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Change Date
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={roundDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>

            {isEditing && (
              <Button
                onClick={handleSaveChanges}
                disabled={isSaving}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
