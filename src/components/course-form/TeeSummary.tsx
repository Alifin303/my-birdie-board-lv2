
import React from "react";
import { calculateRatings } from "./course-utils";
import { TeeData } from "./types";

interface TeeSummaryProps {
  currentTee: TeeData;
}

export function TeeSummary({ currentTee }: TeeSummaryProps) {
  const { rating, slope, par, yards } = calculateRatings(currentTee);
  
  return (
    <div className="border rounded-md p-4 bg-muted/30">
      <h3 className="text-sm font-medium mb-2">Tee Summary</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><span className="font-medium">Total Par:</span> {par}</div>
        <div><span className="font-medium">Total Yards:</span> {yards}</div>
        <div><span className="font-medium">Course Rating:</span> {rating}</div>
        <div><span className="font-medium">Slope Rating:</span> {slope}</div>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Note: Course and slope ratings are automatically calculated based on the hole data.
        These are approximate values and may differ from official ratings.
      </p>
    </div>
  );
}
