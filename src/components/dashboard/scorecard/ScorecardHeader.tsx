
import { format } from "date-fns";
import { CalendarIcon, Edit, Save, X, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScorecardHeaderProps } from "./types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  
  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h3 className="text-xl font-semibold tracking-tight">
              {round.courses?.clubName} - {round.courses?.courseName}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground">
              {isEditing ? (
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[240px] pl-3 text-left font-normal"
                    >
                      {roundDate ? (
                        format(roundDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                <span>
                  {roundDate ? format(roundDate, "PPP") : format(new Date(round.date), "PPP")}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Round
            </Button>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="mt-4 flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="flex items-center space-x-4">
            <div className="grid gap-2">
              <Label htmlFor="detailed-stats">Show Detailed Stats</Label>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="detailed-stats" 
                  checked={showDetailedStats}
                  onCheckedChange={setShowDetailedStats}
                />
                <Label htmlFor="detailed-stats" className="flex items-center space-x-1">
                  <BarChart2 className="h-4 w-4 text-muted-foreground" />
                  <span>{showDetailedStats ? 'Detailed' : 'Basic'}</span>
                </Label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
