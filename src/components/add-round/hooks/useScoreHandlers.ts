import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Tee, Course, HoleScore } from '../types';

export const useScoreHandlers = () => {
  const [scores, setScores] = useState<HoleScore[]>([]);
  const { toast } = useToast();

  const initializeScores = (
    selectedTee: Tee | null, 
    selectedCourse: Course | null
  ) => {
    if (!selectedCourse) {
      console.log("No course selected, cannot initialize scores");
      return;
    }
    
    let holeData: any[] = [];
    
    if (selectedTee && selectedTee.holes) {
      // If the tee has hole data, use it
      console.log("Initializing scores using tee-specific hole data:", selectedTee.name);
      holeData = selectedTee.holes;
    } else if (selectedCourse.holes) {
      // Otherwise, use the course's hole data
      console.log("Initializing scores using course hole data (no tee-specific data)");
      holeData = selectedCourse.holes;
    } else {
      console.error("No hole data found for course or tee");
      toast({
        title: "Error",
        description: "Failed to load hole data for this course. Default values will be used.",
        variant: "destructive",
      });
      
      // Create default holes if none exist
      holeData = Array.from({ length: 18 }, (_, i) => ({
        number: i + 1,
        par: 4,
        handicap: i + 1,
        yards: 400
      }));
    }
    
    // Create the score array, making sure we have proper par values
    const initialScores = holeData.map((hole: any) => {
      // Ensure we have valid hole number and par
      const holeNumber = hole.number || hole.hole || 0;
      let par = hole.par || 4; // Default to par 4 if not specified
      
      // For user-added courses, sometimes par may be in a nested structure
      if (typeof hole.par === 'object') {
        par = hole.par.men || hole.par.default || 4;
      }
      
      console.log(`Hole ${holeNumber}: Par ${par}`);
      
      return {
        hole: holeNumber,
        par: par,
        strokes: null
      };
    });
    
    console.log("Initialized scores:", initialScores);
    setScores(initialScores);
  };

  const handleHoleScoreChange = (index: number, value: string) => {
    // Only update if the value is valid
    if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 20)) {
      const newScores = [...scores];
      newScores[index] = {
        ...newScores[index],
        strokes: value === '' ? null : parseInt(value)
      };
      setScores(newScores);
    }
  };

  return {
    scores,
    setScores,
    initializeScores,
    handleHoleScoreChange,
  };
};
