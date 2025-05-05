
import React from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Trophy, Share2, AlertCircle } from 'lucide-react';
import { formatToPar, detectAchievements, createShareData } from './add-round/utils/scoreUtils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from './ui/alert';

interface Hole {
  number: number;
  par: number;
  score?: number;
}

const defaultHoles: Hole[] = Array.from({ length: 18 }, (_, i) => ({
  number: i + 1,
  par: 4, // Default par
}));

export const ScoreCard = () => {
  const [holes, setHoles] = React.useState<Hole[]>(defaultHoles);
  const [courseName, setCourseName] = React.useState('Pine Valley Golf Club');
  const [totalScore, setTotalScore] = React.useState(0);
  const [shareSupported, setShareSupported] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [holeSelection, setHoleSelection] = React.useState<'all' | 'front9' | 'back9'>('all');
  const { toast } = useToast();

  // Check if Web Share API is supported
  React.useEffect(() => {
    setShareSupported(!!navigator.share);
  }, []);

  const handleScoreChange = (holeNumber: number, score: string) => {
    const newScore = parseInt(score) || 0;
    setHoles(prevHoles =>
      prevHoles.map(hole =>
        hole.number === holeNumber ? { ...hole, score: newScore } : hole
      )
    );

    // Calculate total score
    const newTotalScore = holes.reduce((acc, hole) => {
      if (hole.number === holeNumber) {
        return acc + newScore;
      }
      return acc + (hole.score || 0);
    }, 0);
    setTotalScore(newTotalScore);
    
    // Clear validation error when user enters scores
    setValidationError(null);
  };

  const handleHoleSelectionChange = (selection: 'all' | 'front9' | 'back9') => {
    // We don't need to reset scores when changing hole selection - they should be preserved
    setHoleSelection(selection);
    // Clear validation error when changing hole selection
    setValidationError(null);
  };

  const validateScores = (): boolean => {
    let requiredHoles: Hole[] = [];
    
    if (holeSelection === 'front9') {
      requiredHoles = holes.filter(hole => hole.number <= 9);
    } else if (holeSelection === 'back9') {
      requiredHoles = holes.filter(hole => hole.number > 9);
    } else {
      requiredHoles = holes;
    }
    
    const missingScores = requiredHoles.filter(hole => !hole.score);
    
    if (missingScores.length > 0) {
      const holeNumbers = missingScores.map(h => h.number).join(', ');
      setValidationError(`Please enter scores for hole${missingScores.length > 1 ? 's' : ''}: ${holeNumbers}`);
      return false;
    }
    
    return true;
  };

  const handleShareScorecard = async () => {
    if (!validateScores()) {
      return;
    }
    
    if (!navigator.share) {
      toast({
        title: "Sharing not supported",
        description: "Your browser doesn't support sharing.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert holes to Score format for achievements detection
      const scores = holes.map(hole => ({
        hole: hole.number,
        par: hole.par,
        strokes: hole.score || 0
      }));

      // Calculate to par
      const totalPar = holes.reduce((sum, hole) => sum + hole.par, 0);
      const toPar = totalScore - totalPar;

      // Detect achievements
      const achievements = detectAchievements(scores);

      // Create share data
      const shareData = createShareData(
        courseName,
        "Default", // Tee name not available in this component
        toPar,
        totalScore,
        achievements
      );

      await navigator.share({
        ...shareData,
        url: "https://mybirdieboard.com"
      });

      toast({
        title: "Shared successfully",
        description: "Your scorecard was shared successfully!",
      });
    } catch (error) {
      console.error("Error sharing:", error);
      
      // User cancelled sharing
      if ((error as Error).name === 'AbortError') {
        return;
      }

      toast({
        title: "Error sharing",
        description: "There was an error sharing your scorecard.",
        variant: "destructive",
      });
    }
  };

  const handleSaveRound = () => {
    if (!validateScores()) {
      return;
    }
    
    // Here you would implement the save functionality
    toast({
      title: "Round saved",
      description: "Your round has been saved successfully!",
    });
  };

  // Group holes into chunks of 3 for mobile display
  const frontNineChunks = [
    holes.slice(0, 3),
    holes.slice(3, 6),
    holes.slice(6, 9)
  ];
  
  const backNineChunks = [
    holes.slice(9, 12),
    holes.slice(12, 15),
    holes.slice(15, 18)
  ];

  return (
    <Card className="p-6 animate-fade-in backdrop-blur-sm bg-white/90 border-0 shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-accent mb-2">{courseName}</h2>
        <div className="flex items-center justify-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-primary" />
          <span>Total Score: {totalScore}</span>
        </div>
      </div>
      
      <div className="mb-6 space-y-2">
        <label className="block text-sm font-medium mb-1">Holes Played</label>
        <div className="flex space-x-2">
          <Button 
            variant={holeSelection === 'all' ? "default" : "outline"} 
            size="sm"
            onClick={() => handleHoleSelectionChange('all')}
            className="flex-1"
          >
            All 18
          </Button>
          <Button 
            variant={holeSelection === 'front9' ? "default" : "outline"} 
            size="sm"
            onClick={() => handleHoleSelectionChange('front9')}
            className="flex-1"
          >
            Front 9
          </Button>
          <Button 
            variant={holeSelection === 'back9' ? "default" : "outline"} 
            size="sm"
            onClick={() => handleHoleSelectionChange('back9')}
            className="flex-1"
          >
            Back 9
          </Button>
        </div>
      </div>
      
      {validationError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            {validationError}
          </AlertDescription>
        </Alert>
      )}

      {/* Desktop layout - hidden on small screens */}
      <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-6 gap-4">
        {holes.map((hole) => {
          // For desktop view, show only relevant holes based on selection
          const isVisible = 
            holeSelection === 'all' || 
            (holeSelection === 'front9' && hole.number <= 9) ||
            (holeSelection === 'back9' && hole.number > 9);
            
          if (!isVisible) return null;
          
          const isRequired = 
            (holeSelection === 'front9' && hole.number <= 9) ||
            (holeSelection === 'back9' && hole.number > 9) ||
            holeSelection === 'all';
            
          return (
            <div key={`desktop-${hole.number}`} className="text-center">
              <label className="block text-sm font-medium text-accent/80 mb-1">
                Hole {hole.number}{isRequired && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <Input
                type="number"
                min="1"
                max="20"
                value={hole.score || ''}
                onChange={(e) => handleScoreChange(hole.number, e.target.value)}
                className={`w-full text-center bg-white/80 border-accent/20 focus:border-accent/40 score-input ${
                  isRequired && !hole.score ? 'border-red-300 focus:border-red-500' : ''
                }`}
                placeholder="0"
                inputMode="numeric"
                required={isRequired}
              />
              <span className="text-xs text-accent/60 mt-1 block">
                Par {hole.par}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile layout - visible only on small screens */}
      <div className="sm:hidden space-y-6">
        {(holeSelection === 'all' || holeSelection === 'front9') && (
          <div className="space-y-4">
            <h3 className="text-md font-medium text-primary">Front Nine</h3>
            {frontNineChunks.map((chunk, chunkIndex) => (
              <div key={`front-chunk-${chunkIndex}`} className="grid grid-cols-3 gap-2">
                {chunk.map((hole) => (
                  <div key={`mobile-${hole.number}`} className="text-center">
                    <label className="block text-sm font-medium text-accent/80 mb-1">
                      #{hole.number}{(holeSelection === 'all' || holeSelection === 'front9') && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={hole.score || ''}
                      onChange={(e) => handleScoreChange(hole.number, e.target.value)}
                      className={`w-full text-center bg-white/80 border-accent/20 focus:border-accent/40 score-input ${
                        (holeSelection === 'all' || holeSelection === 'front9') && !hole.score ? 'border-red-300 focus:border-red-500' : ''
                      }`}
                      placeholder="0"
                      inputMode="numeric"
                      required={(holeSelection === 'all' || holeSelection === 'front9')}
                    />
                    <span className="text-xs text-accent/60 mt-1 block">
                      Par {hole.par}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        
        {(holeSelection === 'all' || holeSelection === 'back9') && (
          <div className="space-y-4">
            <h3 className="text-md font-medium text-primary">Back Nine</h3>
            {backNineChunks.map((chunk, chunkIndex) => (
              <div key={`back-chunk-${chunkIndex}`} className="grid grid-cols-3 gap-2">
                {chunk.map((hole) => (
                  <div key={`mobile-${hole.number}`} className="text-center">
                    <label className="block text-sm font-medium text-accent/80 mb-1">
                      #{hole.number}{(holeSelection === 'all' || holeSelection === 'back9') && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={hole.score || ''}
                      onChange={(e) => handleScoreChange(hole.number, e.target.value)}
                      className={`w-full text-center bg-white/80 border-accent/20 focus:border-accent/40 score-input ${
                        (holeSelection === 'all' || holeSelection === 'back9') && !hole.score ? 'border-red-300 focus:border-red-500' : ''
                      }`}
                      placeholder="0"
                      inputMode="numeric"
                      required={(holeSelection === 'all' || holeSelection === 'back9')}
                    />
                    <span className="text-xs text-accent/60 mt-1 block">
                      Par {hole.par}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <Button 
          className="bg-accent hover:bg-accent/90 text-white shadow-md hover:shadow-lg transition-all duration-300"
          onClick={handleSaveRound}
        >
          Save Round
        </Button>
        
        {shareSupported && totalScore > 0 && (
          <Button 
            variant="outline" 
            className="flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300"
            onClick={handleShareScorecard}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        )}
      </div>
    </Card>
  );
};
