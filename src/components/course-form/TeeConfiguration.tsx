
import React from "react";
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
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Configure {currentTee.name} Tee Box
      </label>
      
      <Select
        value={currentTee.name}
        onValueChange={handleTeeChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select tee color" />
        </SelectTrigger>
        <SelectContent>
          {teeOptions.map((tee) => (
            <SelectItem key={tee.name} value={tee.name}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: tee.color, border: tee.color === '#FFFFFF' ? '1px solid #ccc' : 'none' }} 
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
