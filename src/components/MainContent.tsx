
import React from 'react';
import { Button } from './ui/button';
import { ArrowRight, Upload, BarChart2, Award, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SignUpDialog } from './SignUpDialog';
import { Card, CardContent } from './ui/card';

export const MainContent = () => {
  return (
    <div className="w-full max-w-5xl mx-auto text-center px-4 py-16 flex flex-col justify-center h-full">
      <div className="mb-12 animate-fade-in">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 drop-shadow-md">
          Welcome to BirdieBoard – <br className="hidden sm:block" />Your Ultimate Golf Tracking Hub!
        </h1>
        <p className="text-lg md:text-xl text-white/90 font-medium mb-10 max-w-3xl mx-auto">
          BirdieBoard is the all-in-one platform for golfers looking to track progress, analyze performance, and compete on leaderboards. Whether you're a casual weekend golfer or a dedicated player chasing lower scores, BirdieBoard helps you upload scorecards, track your handicap, and see your game improve over time.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <SignUpDialog />
        </div>
      </div>
      
      {/* Features Section */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left justify-center">
        <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-4 flex flex-col h-full">
            <div className="bg-accent/20 rounded-full p-2 w-fit mb-3">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Upload & Store Your Scorecards</h3>
            <p className="text-white/80 mb-3 text-sm">Keep a history of your rounds and track stats effortlessly.</p>
            <div className="mt-auto">
              <Link to="/about">
                <Button variant="link" className="text-white p-0 hover:text-white/80">
                  Learn more <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-4 flex flex-col h-full">
            <div className="bg-accent/20 rounded-full p-2 w-fit mb-3">
              <BarChart2 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Visual Progress Tracking</h3>
            <p className="text-white/80 mb-3 text-sm">Charts and graphs give you insights into your strengths and areas to improve.</p>
            <div className="mt-auto">
              <Link to="/about">
                <Button variant="link" className="text-white p-0 hover:text-white/80">
                  Learn more <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-4 flex flex-col h-full">
            <div className="bg-accent/20 rounded-full p-2 w-fit mb-3">
              <Award className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Handicap Generator</h3>
            <p className="text-white/80 mb-3 text-sm">Get an accurate handicap calculation based on your rounds.</p>
            <div className="mt-auto">
              <Link to="/about">
                <Button variant="link" className="text-white p-0 hover:text-white/80">
                  Learn more <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-4 flex flex-col h-full">
            <div className="bg-accent/20 rounded-full p-2 w-fit mb-3">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Course Leaderboards</h3>
            <p className="text-white/80 mb-3 text-sm">Compete with friends and other golfers at your favorite courses.</p>
            <div className="mt-auto">
              <Link to="/about">
                <Button variant="link" className="text-white p-0 hover:text-white/80">
                  Learn more <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Call to action */}
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to take your game to the next level?</h2>
        <p className="text-xl text-white/90 mb-6">Sign up today and start tracking your journey to better golf!</p>
        <SignUpDialog />
      </div>
    </div>
  );
};
