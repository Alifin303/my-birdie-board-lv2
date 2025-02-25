
import React from 'react';
import { CourseSelector } from './CourseSelector';
import { ScoreCard } from './ScoreCard';
import { Button } from './ui/button';
import { Trophy, ArrowUpRight } from 'lucide-react';

export const MainContent = () => {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col">
          <h1 className="text-5xl font-bold text-accent tracking-tight">
            BirdieBoard
          </h1>
          <p className="text-primary/80 mt-2">
            Track your scores. Challenge your friends. Improve your game.
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2 backdrop-blur-sm bg-white/70">
          View Leaderboard
          <ArrowUpRight className="w-4 h-4" />
        </Button>
      </div>

      <CourseSelector />
      <ScoreCard />

      <div className="mt-8 text-center">
        <Button
          variant="secondary"
          className="flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Trophy className="w-4 h-4" />
          Upgrade to Pro
        </Button>
      </div>
    </div>
  );
};
