
import React from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { teeOptions, TeeData } from "./types";

interface TeeConfigurationProps {
  currentTee: TeeData;
  handleTeeChange: (teeName: string) => void;
  onRatingChange: (field: 'rating' | 'slope', value: number) => void;
}

export function TeeConfiguration({ 
  currentTee, 
  handleTeeChange,
  onRatingChange
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
          <SelectValue>
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
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="course-rating" className="text-sm font-medium">
            Course Rating
          </Label>
          <Input
            id="course-rating"
            type="number"
            step="0.1"
            value={currentTee.rating || (currentTee.holes.length === 9 ? 36.0 : 72.0)}
            onChange={(e) => onRatingChange('rating', parseFloat(e.target.value) || (currentTee.holes.length === 9 ? 36.0 : 72.0))}
            placeholder={currentTee.holes.length === 9 ? "36.0" : "72.0"}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="slope-rating" className="text-sm font-medium">
            Slope Rating
          </Label>
          <Input
            id="slope-rating"
            type="number"
            min="55"
            max="155"
            value={currentTee.slope || 113}
            onChange={(e) => onRatingChange('slope', parseInt(e.target.value) || 113)}
            placeholder="113"
          />
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">
        Course and slope ratings will be auto-calculated if left at defaults, or you can enter official ratings.
      </p>
    </div>
  );
}
