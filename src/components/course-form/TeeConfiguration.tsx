
import React, { useEffect } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { teeOptions, TeeData } from "./types";

interface TeeConfigurationProps {
  currentTee: TeeData;
  handleTeeChange: (teeName: string) => void;
}

export function TeeConfiguration({ 
  currentTee, 
  handleTeeChange 
}: TeeConfigurationProps) {
  // Log when currentTee changes for debugging
  useEffect(() => {
    console.log("TeeConfiguration re-rendering with tee:", currentTee.name, currentTee.color);
  }, [currentTee]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Configure {currentTee.name} Tee Box
      </label>
      
      <Select
        value={currentTee.name}
        onValueChange={handleTeeChange}
        defaultValue={currentTee.name}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a tee box">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ 
                  backgroundColor: currentTee.color,
                  border: currentTee.color === '#FFFFFF' ? '1px solid #ccc' : 'none' 
                }} 
              />
              {currentTee.name} ({currentTee.gender === 'male' ? 'Men\'s' : 'Women\'s'})
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {teeOptions.map((tee) => (
            <SelectItem key={tee.name} value={tee.name}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ 
                    backgroundColor: tee.color, 
                    border: tee.color === '#FFFFFF' ? '1px solid #ccc' : 'none' 
                  }} 
                />
                {tee.name} ({tee.gender === 'male' ? 'Men\'s' : 'Women\'s'})
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <p className="text-xs text-muted-foreground mt-1">
        The community benefits from having all relevant tees added — feel free to add more!
      </p>
    </div>
  );
}
