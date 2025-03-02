
import React from "react";
import { Button } from "@/components/ui/button";
import { HoleSelection } from "@/components/add-round/types";

interface HoleSelectorProps {
  holeSelection: HoleSelection;
  handleHoleSelectionChange: (selection: HoleSelection) => void;
}

export const HoleSelector: React.FC<HoleSelectorProps> = ({
  holeSelection,
  handleHoleSelectionChange
}) => {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">Holes Played</label>
      <div className="flex space-x-1">
        <Button 
          variant={holeSelection === 'all' ? "default" : "outline"}
          size="sm"
          onClick={() => handleHoleSelectionChange('all')}
          className="flex-1 h-9 px-2"
        >
          All 18
        </Button>
        <Button 
          variant={holeSelection === 'front9' ? "default" : "outline"} 
          size="sm"
          onClick={() => handleHoleSelectionChange('front9')}
          className="flex-1 h-9 px-2"
        >
          Front 9
        </Button>
        <Button 
          variant={holeSelection === 'back9' ? "default" : "outline"} 
          size="sm"
          onClick={() => handleHoleSelectionChange('back9')}
          className="flex-1 h-9 px-2"
        >
          Back 9
        </Button>
      </div>
    </div>
  );
};
