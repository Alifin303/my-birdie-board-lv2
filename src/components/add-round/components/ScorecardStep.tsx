import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CalendarIcon, AlertCircle, BarChart } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { HoleSelection, Score, SimplifiedCourseDetail, ScoreSummary, SimplifiedTee } from "../types";
import { HoleScore } from "@/components/dashboard/scorecard/types";
import { ScoreTable } from "@/components/dashboard/scorecard/ScoreTable";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScorecardStepProps {
  selectedCourse: SimplifiedCourseDetail | null;
  selectedTeeId: string | null;
  roundDate: Date | undefined;
  handleTeeChange: (teeId: string) => void;
  handleDateSelect: (date: Date | undefined) => void;
  handleHoleSelectionChange: (selection: HoleSelection) => void;
  handleScoreChange: (index: number, field: 'strokes' | 'putts' | 'penalties', value: string) => void;
  handleGIRChange?: (index: number, value: boolean) => void;
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
  handleGIRChange,
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
  const [localSelectedTeeId, setLocalSelectedTeeId] = useState<string | null>(selectedTeeId);
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (selectedTeeId !== localSelectedTeeId) {
      console.log("Updating local tee ID from prop:", selectedTeeId);
      setLocalSelectedTeeId(selectedTeeId);
    }
  }, [selectedTeeId]);

  useEffect(() => {
    if (localSelectedTeeId && localSelectedTeeId !== selectedTeeId) {
      console.log("Updating parent tee ID from local state:", localSelectedTeeId);
      handleTeeChange(localSelectedTeeId);
    }
  }, [localSelectedTeeId]);

  useEffect(() => {
    if (selectedCourse) {
      console.log("Scorecard Step - Selected Course:", {
        id: selectedCourse.id,
        name: selectedCourse.name,
        isUserAdded: selectedCourse.isUserAdded,
        teeCount: selectedCourse.tees?.length
      });
      
      if (selectedCourse.tees) {
        console.log("Available tees:", selectedCourse.tees.map(t => ({
          id: t.id,
          name: t.name,
          par: t.par,
          rating: t.rating,
          slope: t.slope
        })));
      }
    }
  }, [selectedCourse]);

  if (!selectedCourse) return null;

  const selectedTee = selectedCourse.tees.find(tee => tee.id === localSelectedTeeId);
  
  console.log("========== SCORECARD STEP TEE SELECTION ==========");
  console.log("selectedTeeId (prop):", selectedTeeId);
  console.log("localSelectedTeeId (state):", localSelectedTeeId);
  console.log("Available tees:", selectedCourse.tees.map(t => ({ 
    id: t.id, 
    name: t.name,
    par: t.par,
    rating: t.rating,
    slope: t.slope
  })));
  console.log("selectedTee object:", selectedTee);
  if (selectedTee) {
    console.log("Selected tee name:", selectedTee.name);
    console.log("Selected tee par:", selectedTee.par);
    console.log("Selected tee rating/slope:", selectedTee.rating, "/", selectedTee.slope);
  } else {
    console.error("No tee found for ID:", localSelectedTeeId);
    if (selectedCourse.tees && selectedCourse.tees.length > 0) {
      console.log("Recovering by selecting first available tee:", selectedCourse.tees[0].id);
      setLocalSelectedTeeId(selectedCourse.tees[0].id);
    }
  }
  console.log("=================================================");
  
  const handleTeeChangeWithLocalState = (teeId: string) => {
    console.log("Local tee change handler called with ID:", teeId);
    setLocalSelectedTeeId(teeId);
    handleTeeChange(teeId);
  };

  const getTeeColor = (teeName: string) => {
    const lowerName = teeName.toLowerCase();
    if (lowerName.includes('black')) return '#000';
    if (lowerName.includes('blue')) return '#005';
    if (lowerName.includes('white')) return '#fff';
    if (lowerName.includes('gold')) return '#FB0';
    if (lowerName.includes('green')) return '#060';
    if (lowerName.includes('yellow')) return '#FF0';
    if (lowerName.includes('red')) return '#C00';
    if (lowerName.includes('silver')) return '#C0C0C0';
    return '#777';
  };

  const convertToHoleScores = (scores: Score[]): HoleScore[] => {
    return scores.map(score => ({
      hole: score.hole,
      par: score.par,
      strokes: score.strokes || 0,
      putts: score.putts,
      gir: score.gir,
      penalties: score.penalties
    }));
  };

  const frontNineScores = scores.filter(score => score.hole <= 9);
  const backNineScores = scores.filter(score => score.hole > 9);
  
  const frontNineHoleScores = convertToHoleScores(frontNineScores);
  const backNineHoleScores = convertToHoleScores(backNineScores);

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
      
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-3 gap-4'} mb-4`}>
        <div className="space-y-1">
          <label className="text-sm font-medium">Date Played</label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {roundDate ? format(roundDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={roundDate}
                onSelect={handleDateSelect}
                disabled={(date) => date > today}
                initialFocus
                className="z-50"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium">Tee Played</label>
          <Select 
            value={localSelectedTeeId || undefined}
            onValueChange={(value) => {
              console.log("Tee selection changed to:", value);
              handleTeeChangeWithLocalState(value);
            }}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select a tee box">
                {selectedTee && (
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{
                        backgroundColor: getTeeColor(selectedTee.name),
                        border: selectedTee.name.toLowerCase().includes('white') ? '1px solid #ccc' : 'none'
                      }}
                    ></div>
                    {selectedTee.name}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {selectedCourse.tees.map((tee: SimplifiedTee) => {
                console.log(`Rendering tee option: ${tee.id} - ${tee.name} (selected: ${tee.id === localSelectedTeeId})`);
                return (
                  <SelectItem key={tee.id} value={tee.id}>
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{
                          backgroundColor: getTeeColor(tee.name),
                          border: tee.name.toLowerCase().includes('white') ? '1px solid #ccc' : 'none'
                        }}
                      ></div>
                      {tee.name}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          
          {selectedTee && (
            <div className="text-xs text-muted-foreground mt-1">
              Rating: {selectedTee.rating} | Slope: {selectedTee.slope} | Par: {selectedTee.par}
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium">Holes Played</label>
          <div className="flex space-x-1">
            <Button 
              variant={holeSelection.type === 'all' ? "default" : "outline"}
              size="sm"
              onClick={() => handleHoleSelectionChange({ type: 'all' })}
              className="flex-1 h-9 px-2"
            >
              All 18
            </Button>
            <Button 
              variant={holeSelection.type === 'front9' ? "default" : "outline"} 
              size="sm"
              onClick={() => handleHoleSelectionChange({ type: 'front9' })}
              className="flex-1 h-9 px-2"
            >
              Front 9
            </Button>
            <Button 
              variant={holeSelection.type === 'back9' ? "default" : "outline"} 
              size="sm"
              onClick={() => handleHoleSelectionChange({ type: 'back9' })}
              className="flex-1 h-9 px-2"
            >
              Back 9
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 mb-4">
        <Switch
          id="detailed-stats"
          checked={showDetailedStats}
          onCheckedChange={setShowDetailedStats}
        />
        <Label htmlFor="detailed-stats" className="flex items-center cursor-pointer">
          <BarChart className="h-4 w-4 mr-1.5 text-primary" />
          <span>Track advanced stats (putts, GIR, penalties)</span>
        </Label>
      </div>
      
      {frontNineScores.length > 0 && (
        <div className="mb-4">
          <ScoreTable
            scores={frontNineHoleScores}
            isEditing={true}
            handleScoreChange={handleScoreChange}
            handleGIRChange={handleGIRChange}
            title="Front Nine"
            startIndex={0}
            showDetailedStats={showDetailedStats}
          />
        </div>
      )}
      
      {backNineScores.length > 0 && (
        <div className="mb-4">
          <ScoreTable
            scores={backNineHoleScores}
            isEditing={true}
            handleScoreChange={handleScoreChange}
            handleGIRChange={handleGIRChange}
            title="Back Nine"
            startIndex={frontNineScores.length}
            showDetailedStats={showDetailedStats}
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 items-start">
        <Card className="p-3">
          <h3 className="text-sm font-medium mb-2">Round Summary</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Par:</span>
              <span className="font-medium">{scoreSummary.totalPar}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gross Score:</span>
              <span className="font-medium">
                {scoreSummary.totalStrokes || '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">To Par:</span>
              <span className="font-medium">
                {scoreSummary.totalStrokes ? 
                  (scoreSummary.toPar > 0 ? 
                    `+${scoreSummary.toPar}` : 
                    scoreSummary.toPar) : 
                  '-'}
              </span>
            </div>
            {showDetailedStats && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Putts:</span>
                <span className="font-medium">
                  {scoreSummary.puttsRecorded ? scoreSummary.totalPutts : '-'}
                </span>
              </div>
            )}
          </div>
        </Card>
        
        <Card className="p-3">
          <h3 className="text-sm font-medium mb-2">Front Nine Summary</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Par:</span>
              <span className="font-medium">{scoreSummary.front9Par}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Score:</span>
              <span className="font-medium">{scoreSummary.front9Strokes || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">To Par:</span>
              <span className="font-medium">
                {scoreSummary.front9Strokes ? 
                  (scoreSummary.front9ToPar > 0 ? 
                    `+${scoreSummary.front9ToPar}` : 
                    scoreSummary.front9ToPar) : 
                  '-'}
              </span>
            </div>
          </div>
        </Card>
        
        <Card className="p-3">
          <h3 className="text-sm font-medium mb-2">Back Nine Summary</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Par:</span>
              <span className="font-medium">{scoreSummary.back9Par}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Score:</span>
              <span className="font-medium">{scoreSummary.back9Strokes || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">To Par:</span>
              <span className="font-medium">
                {scoreSummary.back9Strokes ? 
                  (scoreSummary.back9ToPar > 0 ? 
                    `+${scoreSummary.back9ToPar}` : 
                    scoreSummary.back9ToPar) : 
                  '-'}
              </span>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="flex justify-between space-x-4 mt-6">
        <Button variant="outline" onClick={handleCloseModal} className="flex-1">
          Cancel
        </Button>
        <Button 
          onClick={() => {
            if (localSelectedTeeId !== selectedTeeId) {
              console.log("CRITICAL: Fixing tee ID mismatch before save");
              console.log(`Local tee ID: ${localSelectedTeeId}, Parent tee ID: ${selectedTeeId}`);
              handleTeeChange(localSelectedTeeId || "");
            }
            
            const actualSelectedTee = selectedCourse.tees.find(tee => tee.id === localSelectedTeeId);
            
            console.log("Save button clicked with teeId:", localSelectedTeeId);
            console.log("Selected tee at save time:", actualSelectedTee);
            if (actualSelectedTee) {
              console.log("Selected tee name at save time:", actualSelectedTee.name);
              console.log("Saving round with tee:", localSelectedTeeId, actualSelectedTee.name);
            } else {
              console.error("No selected tee found at save time for ID:", localSelectedTeeId);
            }
            
            handleSaveRound();
          }} 
          disabled={isLoading} 
          className="flex-1"
        >
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
