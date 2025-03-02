
import React from "react";
import { Card } from "@/components/ui/card";

interface RoundSummaryProps {
  title: string;
  par: number;
  strokes: number;
  toPar: number;
}

export const RoundSummary: React.FC<RoundSummaryProps> = ({
  title,
  par,
  strokes,
  toPar
}) => {
  return (
    <Card className="p-3">
      <h3 className="text-sm font-medium mb-2">{title}</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Par:</span>
          <span className="font-medium">{par}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Gross Score:</span>
          <span className="font-medium">
            {strokes || '-'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">To Par:</span>
          <span className="font-medium">
            {strokes ? 
              (toPar > 0 ? 
                `+${toPar}` : 
                toPar) : 
              '-'}
          </span>
        </div>
      </div>
    </Card>
  );
};
