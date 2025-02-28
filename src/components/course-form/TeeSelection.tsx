
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { TeeData } from "./types";

interface TeeSelectionProps {
  tees: TeeData[];
  currentTeeIndex: number;
  setCurrentTeeIndex: (index: number) => void;
  handleAddTee: () => void;
  handleRemoveTee: (index: number) => void;
}

export function TeeSelection({ 
  tees, 
  currentTeeIndex, 
  setCurrentTeeIndex, 
  handleAddTee, 
  handleRemoveTee 
}: TeeSelectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Tee Boxes</label>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleAddTee}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Tee
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-2">
        {tees.map((tee, index) => (
          <div key={tee.id} className="flex items-center">
            <Button
              variant={currentTeeIndex === index ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentTeeIndex(index)}
              className="flex items-center gap-1"
              style={{ 
                borderColor: tee.color,
                boxShadow: currentTeeIndex === index ? `0 0 0 1px ${tee.color}` : 'none'
              }}
            >
              {tee.name}
              
              {tees.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTee(index);
                  }}
                >
                  <Trash className="h-3 w-3" />
                </Button>
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
