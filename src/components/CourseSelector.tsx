
import React from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Search } from 'lucide-react';

export const CourseSelector = () => {
  return (
    <Card className="p-4 mb-6 animate-slide-in backdrop-blur-sm bg-white/80 border-0 shadow-lg">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent/60 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search for a golf course..."
          className="pl-10 border-accent/20 focus:border-accent/40"
        />
      </div>
    </Card>
  );
};
