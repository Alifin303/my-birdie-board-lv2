
import React from 'react';
import { Button } from './ui/button';
import { UserPlus, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MainContent = () => {
  return (
    <div className="text-center px-4">
      <div className="mb-12">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm">
            <img 
              src="https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/favicon.ico" 
              alt="BirdieBoard" 
              className="w-10 h-10"
            />
          </div>
          <h1 className="text-6xl font-bold text-white tracking-tight">
            BirdieBoard
          </h1>
        </div>
        <p className="text-xl text-white/90 font-medium">
          Your personal golf scorecard in the cloud
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button 
          size="lg"
          className="bg-white text-accent hover:bg-white/90 text-lg px-8 h-12"
        >
          <UserPlus className="mr-2" />
          Sign up
        </Button>
        <Link to="/about">
          <Button 
            variant="outline" 
            size="lg"
            className="bg-transparent border-white text-white hover:bg-white/10 text-lg px-8 h-12"
          >
            <HelpCircle className="mr-2" />
            What is BirdieBoard?
          </Button>
        </Link>
      </div>
    </div>
  );
};
