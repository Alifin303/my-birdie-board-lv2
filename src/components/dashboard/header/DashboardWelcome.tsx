
import React from "react";
import { Button } from "@/components/ui/button";

interface DashboardWelcomeProps {
  firstName: string;
  onAddRound: () => void;
}

export const DashboardWelcome = ({ firstName, onAddRound }: DashboardWelcomeProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {firstName || 'Golfer'}!</h1>
      </div>
      <Button 
        onClick={onAddRound}
        className="relative"
      >
        Add a New Round
      </Button>
    </div>
  );
};
