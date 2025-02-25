
import React from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Trophy } from 'lucide-react';

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
  };

  return (
    <Card className="p-6 animate-fade-in backdrop-blur-sm bg-white/90 border-0 shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-accent mb-2">{courseName}</h2>
        <div className="flex items-center justify-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-primary" />
          <span>Total Score: {totalScore}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {holes.map((hole) => (
          <div key={hole.number} className="text-center">
            <label className="block text-sm font-medium text-accent/80 mb-1">
              Hole {hole.number}
            </label>
            <Input
              type="number"
              min="1"
              max="20"
              value={hole.score || ''}
              onChange={(e) => handleScoreChange(hole.number, e.target.value)}
              className="w-full text-center bg-white/80 border-accent/20 focus:border-accent/40"
              placeholder="0"
            />
            <span className="text-xs text-accent/60 mt-1 block">
              Par {hole.par}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <Button className="bg-accent hover:bg-accent/90 text-white shadow-md hover:shadow-lg transition-all duration-300">
          Save Round
        </Button>
      </div>
    </Card>
  );
};
