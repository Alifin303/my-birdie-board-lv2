
import React from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { SimplifiedTee } from "@/components/add-round/types";

interface TeeSelectorProps {
  selectedTeeId: string | null;
  tees: SimplifiedTee[];
  handleTeeChange: (teeId: string) => void;
}

export const TeeSelector: React.FC<TeeSelectorProps> = ({
  selectedTeeId,
  tees,
  handleTeeChange
}) => {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">Tee Played</label>
      <Select value={selectedTeeId || undefined} onValueChange={handleTeeChange}>
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Select a tee box" />
        </SelectTrigger>
        <SelectContent>
          {tees.map((tee) => (
            <SelectItem key={tee.id} value={tee.id}>
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{
                    backgroundColor: tee.gender === 'male' ? 
                      (tee.name.toLowerCase().includes('black') ? '#000' : 
                      tee.name.toLowerCase().includes('blue') ? '#005' : 
                      tee.name.toLowerCase().includes('white') ? '#fff' : 
                      tee.name.toLowerCase().includes('gold') ? '#FB0' : 
                      tee.name.toLowerCase().includes('green') ? '#060' : 
                      tee.name.toLowerCase().includes('yellow') ? '#FF0' : '#777') :
                      (tee.name.toLowerCase().includes('red') ? '#C00' : 
                      tee.name.toLowerCase().includes('gold') ? '#FB0' : '#FAA'),
                    border: tee.name.toLowerCase().includes('white') ? '1px solid #ccc' : 'none'
                  }}
                ></div>
                {tee.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
