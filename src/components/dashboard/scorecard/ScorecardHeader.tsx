
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Edit, Save, X, BarChart } from "lucide-react";
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
  setShowDetailedStats
}: ScorecardHeaderProps) => {
  // Format date for display
  const formattedDate = roundDate 
    ? format(roundDate, 'MMMM d, yyyy')
    : round.date ? format(new Date(round.date), 'MMMM d, yyyy') : 'Unknown Date';

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div>
        <h3 className="text-lg font-medium">
          {round.courses?.clubName} - {round.courses?.courseName}
        </h3>
        <div className="flex items-center text-sm text-muted-foreground gap-2">
          {isEditing ? (
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 gap-1 text-left font-normal"
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {roundDate ? format(roundDate, 'PP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={roundDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          ) : (
            <>
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {round.tee_name ?? 'Unknown'} Tees
        </div>
      </div>
      
      <div className="flex items-center gap-2 self-end sm:self-auto">
        {setShowDetailedStats && (
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setShowDetailedStats(!showDetailedStats)}
            title="Toggle detailed statistics"
          >
            <BarChart className="h-4 w-4 mr-1" />
            {showDetailedStats ? 'Hide' : 'Show'} Stats
          </Button>
        )}
        
        {isEditing ? (
          <>
            <Button 
              variant="outline" 
              size="sm"
              className="h-8"
              onClick={() => setIsEditing(false)}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Cancel
            </Button>
            <Button 
              variant="default" 
              size="sm"
              className="h-8"
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </>
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            className="h-8"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
        )}
      </div>
    </div>
  );
};
