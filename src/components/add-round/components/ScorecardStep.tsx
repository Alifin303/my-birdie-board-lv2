
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CalendarIcon, AlertCircle } from "lucide-react";
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
import { HoleSelection, Score, SimplifiedCourseDetail, ScoreSummary } from "../types";

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
  lastTeeChangeTimestamp?: number;
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
  today,
  lastTeeChangeTimestamp
}) => {
  if (!selectedCourse) return null;

  // Get the currently selected tee information based on selectedTeeId
  const selectedTee = selectedCourse.tees.find(tee => tee.id === selectedTeeId);
  
  // Debug logging for tee selection issues
  useEffect(() => {
    console.log("========== SCORECARD STEP TEE SELECTION ==========");
    console.log("selectedTeeId:", selectedTeeId);
    console.log("Last tee change timestamp:", lastTeeChangeTimestamp ? new Date(lastTeeChangeTimestamp).toISOString() : "Not available");
    console.log("Available tees:", selectedCourse.tees.map(t => ({ id: t.id, name: t.name })));
    console.log("selectedTee object:", selectedTee);
    if (selectedTee) {
      console.log("Selected tee name:", selectedTee.name);
      console.log("Rendering dropdown with selected tee:", selectedTeeId);
      console.log("Dropdown should now show:", selectedTeeId, selectedTee.name);
    } else {
      console.error("No tee found for ID:", selectedTeeId);
    }
    console.log("=================================================");
  }, [selectedTeeId, selectedCourse.tees, selectedTee, lastTeeChangeTimestamp]);
  
  // Helper function to determine tee color
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

  // Force re-render when tee selection changes
  const teeKey = `tee-${selectedTeeId}-${lastTeeChangeTimestamp || 0}`;

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
            key={teeKey}
            value={selectedTeeId || undefined} 
            onValueChange={(value) => {
              console.log("Tee selection changed to:", value);
              console.log("Selected tee before change:", selectedTee?.name);
              handleTeeChange(value);
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
              {selectedCourse.tees.map((tee) => {
                console.log(`Rendering tee option: ${tee.id} - ${tee.name} (selected: ${tee.id === selectedTeeId})`);
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
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium">Holes Played</label>
          <div className="flex space-x-1">
            <Button 
              variant={holeSelection === 'all' ? "default" : "outline"}
              size="sm"
              onClick={() => {
                console.log("Switching to all 18 holes with current tee:", selectedTeeId);
                handleHoleSelectionChange('all');
              }}
              className="flex-1 h-9 px-2"
            >
              All 18
            </Button>
            <Button 
              variant={holeSelection === 'front9' ? "default" : "outline"} 
              size="sm"
              onClick={() => {
                console.log("Switching to front 9 with current tee:", selectedTeeId);
                handleHoleSelectionChange('front9');
              }}
              className="flex-1 h-9 px-2"
            >
              Front 9
            </Button>
            <Button 
              variant={holeSelection === 'back9' ? "default" : "outline"} 
              size="sm"
              onClick={() => {
                console.log("Switching to back 9 with current tee:", selectedTeeId);
                handleHoleSelectionChange('back9');
              }}
              className="flex-1 h-9 px-2"
            >
              Back 9
            </Button>
          </div>
        </div>
      </div>
      
      {/* Middle section: Front 9 holes */}
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">
          Front Nine 
          {selectedTee && (
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ 
              backgroundColor: 'rgba(0,0,0,0.05)',
              color: getTeeColor(selectedTee.name),
              borderColor: getTeeColor(selectedTee.name),
              borderWidth: '1px'
            }}>
              {selectedTee.name} Tees
            </span>
          )}
        </h3>
        <div className="border rounded-md">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-2 py-2 text-left text-sm font-medium whitespace-nowrap">Hole</th>
                  {scores.filter(score => score.hole <= 9).map(score => (
                    <th key={`hole-${score.hole}`} className="px-2 py-2 text-center text-sm font-medium">{score.hole}</th>
                  ))}
                  <th className="px-2 py-2 text-center text-sm font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-2 py-2 text-sm font-medium">Par</td>
                  {scores.filter(score => score.hole <= 9).map(score => (
                    <td key={`par-${score.hole}`} className="px-1 py-2 text-center">
                      <div className="bg-muted/40 border border-muted rounded-md w-7 h-7 flex items-center justify-center font-medium mx-auto">
                        {score.par}
                      </div>
                    </td>
                  ))}
                  <td className="px-2 py-2 text-center font-medium">{scoreSummary.front9Par}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-2 py-2 text-sm font-medium">Strokes</td>
                  {scores.filter(score => score.hole <= 9).map((score, index) => (
                    <td key={`strokes-${score.hole}`} className="px-1 py-2 text-center">
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={score.strokes || ''}
                        onChange={(e) => handleScoreChange(index, 'strokes', e.target.value)}
                        className="w-9 h-7 text-center mx-auto px-1"
                        inputMode="numeric"
                      />
                    </td>
                  ))}
                  <td className="px-2 py-2 text-center font-medium">
                    {scoreSummary.front9Strokes || '-'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Below Middle: Back 9 holes */}
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">
          Back Nine
          {selectedTee && (
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ 
              backgroundColor: 'rgba(0,0,0,0.05)',
              color: getTeeColor(selectedTee.name),
              borderColor: getTeeColor(selectedTee.name),
              borderWidth: '1px'
            }}>
              {selectedTee.name} Tees
            </span>
          )}
        </h3>
        <div className="border rounded-md">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-2 py-2 text-left text-sm font-medium whitespace-nowrap">Hole</th>
                  {scores.filter(score => score.hole > 9).map(score => (
                    <th key={`hole-${score.hole}`} className="px-2 py-2 text-center text-sm font-medium">{score.hole}</th>
                  ))}
                  <th className="px-2 py-2 text-center text-sm font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-2 py-2 text-sm font-medium">Par</td>
                  {scores.filter(score => score.hole > 9).map(score => (
                    <td key={`par-${score.hole}`} className="px-1 py-2 text-center">
                      <div className="bg-muted/40 border border-muted rounded-md w-7 h-7 flex items-center justify-center font-medium mx-auto">
                        {score.par}
                      </div>
                    </td>
                  ))}
                  <td className="px-2 py-2 text-center font-medium">{scoreSummary.back9Par}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-2 py-2 text-sm font-medium">Strokes</td>
                  {scores.filter(score => score.hole > 9).map((score, index) => {
                    const adjustedIndex = index + scores.filter(s => s.hole <= 9).length;
                    return (
                      <td key={`strokes-${score.hole}`} className="px-1 py-2 text-center">
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          value={score.strokes || ''}
                          onChange={(e) => handleScoreChange(adjustedIndex, 'strokes', e.target.value)}
                          className="w-9 h-7 text-center mx-auto px-1"
                          inputMode="numeric"
                        />
                      </td>
                    );
                  })}
                  <td className="px-2 py-2 text-center font-medium">
                    {scoreSummary.back9Strokes || '-'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Bottom section: Round stats and summary */}
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
      
      {/* Button row */}
      <div className="flex justify-between space-x-4 mt-6">
        <Button variant="outline" onClick={handleCloseModal} className="flex-1">
          Cancel
        </Button>
        <Button 
          onClick={() => {
            console.log("Save button clicked with selectedTeeId:", selectedTeeId);
            console.log("Last tee change timestamp:", lastTeeChangeTimestamp ? new Date(lastTeeChangeTimestamp).toISOString() : "Not available");
            console.log("Selected tee at save time:", selectedTee);
            if (selectedTee) {
              console.log("Selected tee name at save time:", selectedTee.name);
              console.log("Saving round with tee:", selectedTeeId, selectedTee.name);
            } else {
              console.error("No selected tee found at save time for ID:", selectedTeeId);
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
