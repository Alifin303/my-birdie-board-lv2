
import React from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Trophy } from 'lucide-react';
import { Score } from './add-round/types';

export interface ScoreCardProps {
  holes: Score[];
  onChange: (holeIndex: number, field: keyof Score, value: number) => void;
  startIndex: number;
  courseName?: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  holes,
  onChange,
  startIndex = 0,
  courseName = 'Pine Valley Golf Club'
}) => {
  const calculateTotalScore = () => {
    return holes.reduce((acc, hole) => {
      return acc + (hole.strokes || 0);
    }, 0);
  };

  const handleScoreChange = (index: number, value: string) => {
    const newScore = parseInt(value) || 0;
    onChange(startIndex + index, 'strokes', newScore);
  };

  return (
    <Card className="p-6 animate-fade-in backdrop-blur-sm bg-white/90 border-0 shadow-lg">
      {courseName && (
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-accent mb-2">{courseName}</h2>
          <div className="flex items-center justify-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-primary" />
            <span>Total Score: {calculateTotalScore()}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {holes.map((hole, index) => (
          <div key={startIndex + index} className="text-center">
            <label className="block text-sm font-medium text-accent/80 mb-1">
              Hole {hole.hole}
            </label>
            <Input
              type="number"
              min="1"
              max="20"
              value={hole.strokes || ''}
              onChange={(e) => handleScoreChange(index, e.target.value)}
              className="w-full text-center bg-white/80 border-accent/20 focus:border-accent/40"
              placeholder="0"
            />
            <span className="text-xs text-accent/60 mt-1 block">
              Par {hole.par}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
