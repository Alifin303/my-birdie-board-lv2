
import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface DateSelectorProps {
  roundDate: Date | undefined;
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  handleDateSelect: (date: Date | undefined) => void;
  today: Date;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  roundDate,
  calendarOpen,
  setCalendarOpen,
  handleDateSelect,
  today
}) => {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">Date Played</label>
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
            disabled={(date) => date > today}
            initialFocus
            defaultMonth={roundDate || today}
            className="z-50"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
