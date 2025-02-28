
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const handleDaySelect = (day: Date | undefined) => {
    console.log("Calendar day selected:", day);
    if (props.onSelect) {
      props.onSelect(day);
    }
  };

  return (
    <div 
      className="relative bg-white rounded-md shadow-md overflow-hidden" 
      style={{ pointerEvents: 'auto' }}
      onClick={(e) => {
        console.log("Calendar container clicked");
        e.stopPropagation();
      }}
    >
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        onSelect={handleDaySelect}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium text-[#333333]",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-white p-0 text-[#333333] hover:bg-[#f1f1f1] cursor-pointer"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-[#555555] rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-white first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100 cursor-pointer bg-white text-[#333333]"
          ),
          day_selected:
            "bg-white text-[#333333] hover:bg-white hover:text-[#333333] border-2 border-primary focus:bg-white focus:text-[#333333] font-semibold",
          day_today: "bg-[#f1f1f1] text-[#333333] font-medium",
          day_outside:
            "text-[#8a898c] opacity-50",
          day_disabled: "text-[#9f9ea1] opacity-50 cursor-not-allowed",
          day_range_middle:
            "aria-selected:bg-white aria-selected:text-[#333333]",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: ({ ...iconProps }) => (
            <ChevronLeft className="h-4 w-4 text-[#333333]" onClick={(e) => {
              console.log("Previous month clicked");
              e.stopPropagation();
            }} {...iconProps} />
          ),
          IconRight: ({ ...iconProps }) => (
            <ChevronRight className="h-4 w-4 text-[#333333]" onClick={(e) => {
              console.log("Next month clicked");
              e.stopPropagation();
            }} {...iconProps} />
          ),
        }}
        {...props}
      />
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
