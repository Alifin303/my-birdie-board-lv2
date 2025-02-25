
import React from 'react';
import { CourseSelector } from './CourseSelector';
import { ScoreCard } from './ScoreCard';
import { Button } from './ui/button';
import { Trophy, ArrowUpRight } from 'lucide-react';

export const MainContent = () => {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-semibold text-accent">Fairway Fins</h1>
        <Button variant="outline" className="flex items-center gap-2">
          View Leaderboard
          <ArrowUpRight className="w-4 h-4" />
        </Button>
      </div>

      <CourseSelector />
      <ScoreCard />

      <div className="mt-8 text-center">
        <Button
          variant="secondary"
          className="flex items-center gap-2 mx-auto"
        >
          <Trophy className="w-4 h-4" />
          Upgrade to Pro
        </Button>
      </div>
    </div>
  );
};
