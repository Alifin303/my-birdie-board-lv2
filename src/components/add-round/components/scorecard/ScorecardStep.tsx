
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HoleSelection, Score, SimplifiedCourseDetail, ScoreSummary } from "../../types";
import { DateSelector } from "./controls/DateSelector";
import { TeeSelector } from "./controls/TeeSelector";
import { HoleSelector } from "./controls/HoleSelector";
import { ScoreTable } from "./tables/ScoreTable";
import { RoundSummary } from "./summary/RoundSummary";

interface ScorecardStepProps {
  selectedCourse: SimplifiedCourseDetail | null;
  selectedTeeId: string | null;
  roundDate: Date | undefined;
  handleTeeChange: (teeId: string) => void;
  handleDateSelect: (date: Date | undefined) => void;
  handleHoleSelectionChange: (selection: HoleSelection) => void;
  handleScoreChange: (index: number, field: 'strokes' | 'putts', value: string) => void;
  handleBackToSearch: () => void;
  handleSaveRound: () => Promise<void>;
  handleCloseModal: () => void;
  scores: Score[];
  scoreSummary: ScoreSummary;
  holeSelection: HoleSelection;
  calendarOpen: boolean;
  setCalendarOpen: (open: boolean) => void;
  isLoading: boolean;
  dataLoadingError: string | null;
  today: Date;
}

export const ScorecardStep: React.FC<ScorecardStepProps> = ({
  selectedCourse,
  selectedTeeId,
  roundDate,
  handleTeeChange,
  handleDateSelect,
  handleHoleSelectionChange,
  handleScoreChange,
  handleBackToSearch,
  handleSaveRound,
  handleCloseModal,
  scores,
  scoreSummary,
  holeSelection,
  calendarOpen,
  setCalendarOpen,
  isLoading,
  dataLoadingError,
  today
}) => {
  if (!selectedCourse) return null;

  const front9Scores = scores.filter(score => score.hole <= 9);
  const back9Scores = scores.filter(score => score.hole > 9);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">{selectedCourse.clubName !== selectedCourse.name ? 
            `${selectedCourse.clubName} - ${selectedCourse.name}` : 
            selectedCourse.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {selectedCourse.city}{selectedCourse.state ? `, ${selectedCourse.state}` : ''}
            {selectedCourse.isUserAdded && <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">User Added</span>}
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleBackToSearch}
        >
          Change Course
        </Button>
      </div>
      
      {dataLoadingError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            {dataLoadingError}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Top row: Controls in a horizontal layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <DateSelector 
          roundDate={roundDate} 
          calendarOpen={calendarOpen} 
          setCalendarOpen={setCalendarOpen} 
          handleDateSelect={handleDateSelect}
          today={today}
        />
        
        <TeeSelector 
          selectedTeeId={selectedTeeId} 
          tees={selectedCourse.tees} 
          handleTeeChange={handleTeeChange} 
        />
        
        <HoleSelector 
          holeSelection={holeSelection} 
          handleHoleSelectionChange={handleHoleSelectionChange} 
        />
      </div>
      
      {/* Score Tables */}
      <ScoreTable 
        title="Front Nine"
        scores={front9Scores}
        handleScoreChange={handleScoreChange}
        totalPar={scoreSummary.front9Par}
        totalStrokes={scoreSummary.front9Strokes}
        baseIndex={0}
      />
      
      <ScoreTable 
        title="Back Nine"
        scores={back9Scores}
        handleScoreChange={handleScoreChange}
        totalPar={scoreSummary.back9Par}
        totalStrokes={scoreSummary.back9Strokes}
        baseIndex={front9Scores.length}
      />
      
      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 items-start">
        <RoundSummary 
          title="Round Summary"
          par={scoreSummary.totalPar}
          strokes={scoreSummary.totalStrokes}
          toPar={scoreSummary.toPar}
        />
        
        <RoundSummary 
          title="Front Nine Summary"
          par={scoreSummary.front9Par}
          strokes={scoreSummary.front9Strokes}
          toPar={scoreSummary.front9ToPar}
        />
        
        <RoundSummary 
          title="Back Nine Summary"
          par={scoreSummary.back9Par}
          strokes={scoreSummary.back9Strokes}
          toPar={scoreSummary.back9ToPar}
        />
      </div>
      
      {/* Button row */}
      <div className="flex justify-between space-x-4 mt-6">
        <Button variant="outline" onClick={handleCloseModal} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSaveRound} disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Round"
          )}
        </Button>
      </div>
    </div>
  );
};
