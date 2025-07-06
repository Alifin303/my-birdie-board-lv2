import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Save, X, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScorecardHeader } from "./ScorecardHeader";
import { ScoreTable } from "./ScoreTable";
import { ScoreTableSummary } from "./ScoreTableSummary";
import { HoleScore, RoundScorecardProps } from "./types";

export const RoundScorecard = ({ 
  round, 
  isOpen, 
  onOpenChange, 
  handicapIndex = 0, 
  isAdmin = false,
  isDemo = false
}: RoundScorecardProps) => {
  const [scores, setScores] = useState<HoleScore[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const [roundDate, setRoundDate] = useState<Date | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeScores = () => {
      if (round.hole_scores) {
        // Parse the hole_scores if it's a string
        const parsedScores = typeof round.hole_scores === 'string' ? JSON.parse(round.hole_scores) : round.hole_scores;
        setScores(parsedScores);
      } else {
        // Generate a default set of scores if hole_scores is null or undefined
        const defaultScores: HoleScore[] = Array.from({ length: 18 }, (_, i) => ({
          hole: i + 1,
          par: 4, // Default par
        }));
        setScores(defaultScores);
      }
    };

    initializeScores();
    setRoundDate(round.date ? new Date(round.date) : undefined);
  }, [round]);

  const handleScoreChange = (index: number, field: 'strokes' | 'putts' | 'penalties', value: string) => {
    if (isDemo) return; // Prevent editing in demo mode
    
    const newScores = [...scores];
    const numValue = value === '' ? undefined : parseInt(value);
    newScores[index] = { ...newScores[index], [field]: numValue };
    setScores(newScores);
  };

  const handleGIRChange = (index: number, value: boolean) => {
    if (isDemo) return; // Prevent editing in demo mode
    
    const newScores = [...scores];
    newScores[index] = { ...newScores[index], gir: value };
    setScores(newScores);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (isDemo) return; // Prevent editing in demo mode
    setRoundDate(date);
    setCalendarOpen(false);
  };

  const handleSaveChanges = async () => {
    if (isDemo) {
      toast({
        title: "Demo Mode",
        description: "Changes cannot be saved in demo mode. Sign up to start tracking your real rounds!",
        variant: "default",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('rounds')
        .update({
          date: roundDate?.toISOString(),
          hole_scores: JSON.stringify(scores),
          updated_at: new Date().toISOString(),
        })
        .eq('id', round.id);

      if (error) {
        console.error("Error updating round:", error);
        toast({
          title: "Error saving changes",
          description: "There was an error updating the round. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Changes saved",
          description: "Your changes have been saved successfully.",
        });
      }
    } catch (error) {
      console.error("Unexpected error during save:", error);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const front9 = scores.slice(0, 9);
  const back9 = scores.slice(9, 18);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-semibold">
            {isDemo ? "Demo Scorecard - " : ""}{round.courses?.name || 'Scorecard'}
            {isDemo && (
              <span className="ml-2 text-sm bg-primary text-primary-foreground px-2 py-1 rounded">
                Demo
              </span>
            )}
          </DialogTitle>
          <div className="flex items-center gap-2">
            {!isDemo && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailedStats(!showDetailedStats)}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {showDetailedStats ? 'Basic' : 'Detailed'} Stats
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <ScorecardHeader
            round={round}
            isEditing={isEditing && !isDemo}
            setIsEditing={setIsEditing}
            roundDate={roundDate}
            calendarOpen={calendarOpen}
            setCalendarOpen={setCalendarOpen}
            handleDateSelect={handleDateSelect}
            isSaving={isSaving}
            handleSaveChanges={handleSaveChanges}
            showDetailedStats={showDetailedStats}
            setShowDetailedStats={setShowDetailedStats}
            handicapIndex={handicapIndex}
            isDemo={isDemo}
          />

          {/* Front 9 */}
          <ScoreTable
            scores={front9}
            isEditing={isEditing && !isDemo}
            handleScoreChange={handleScoreChange}
            handleGIRChange={handleGIRChange}
            title="Front 9"
            showDetailedStats={showDetailedStats && !isDemo}
          />

          {/* Back 9 */}
          <ScoreTable
            scores={back9}
            isEditing={isEditing && !isDemo}
            handleScoreChange={handleScoreChange}
            handleGIRChange={handleGIRChange}
            title="Back 9"
            startIndex={9}
            showDetailedStats={showDetailedStats && !isDemo}
          />

          {/* Summary */}
          <ScoreTableSummary
            scores={scores}
            handicapIndex={handicapIndex}
            showNet={true}
            showDetailedStats={showDetailedStats && !isDemo}
          />

          {isDemo && (
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">
                This is a demo scorecard with sample data.
              </p>
              <p className="text-sm font-medium">
                Sign up to start tracking your own rounds and accessing all features!
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
