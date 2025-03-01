
import React from 'react';
import { Button } from './ui/button';
import { HelpCircle, ArrowRight, Upload, BarChart2, Award, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SignUpDialog } from './SignUpDialog';
import { Card, CardContent } from './ui/card';

export const MainContent = () => {
  return (
    <div className="w-full max-w-5xl mx-auto text-center px-4 py-16">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-6xl font-bold text-white tracking-tight mb-6 drop-shadow-md">
          Welcome to BirdieBoard – <br />Your Ultimate Golf Tracking Hub!
        </h1>
        <p className="text-xl text-white/90 font-medium mb-10 max-w-3xl mx-auto">
          BirdieBoard is the all-in-one platform for golfers looking to track progress, analyze performance, and compete on leaderboards. Whether you're a casual weekend golfer or a dedicated player chasing lower scores, BirdieBoard helps you upload scorecards, track your handicap, and see your game improve over time.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <SignUpDialog />
          <Link to="/about">
            <Button 
              variant="outline" 
              size="lg"
              className="bg-transparent border-white text-white hover:bg-white/10 text-lg px-8 h-12 transition-all duration-300"
            >
              <HelpCircle className="mr-2" />
              What is BirdieBoard?
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6 flex flex-col">
            <div className="bg-accent/20 rounded-full p-3 w-fit mb-4">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">🔹 Upload & Store Your Scorecards</h3>
            <p className="text-white/80 mb-4">Keep a history of your rounds and track stats effortlessly.</p>
            <div className="mt-auto">
              <Button variant="link" className="text-white p-0 hover:text-white/80">
                Learn more <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6 flex flex-col">
            <div className="bg-accent/20 rounded-full p-3 w-fit mb-4">
              <BarChart2 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">🔹 Visual Progress Tracking</h3>
            <p className="text-white/80 mb-4">Charts and graphs give you insights into your strengths and areas to improve.</p>
            <div className="mt-auto">
              <Button variant="link" className="text-white p-0 hover:text-white/80">
                Learn more <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6 flex flex-col">
            <div className="bg-accent/20 rounded-full p-3 w-fit mb-4">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">🔹 Handicap Generator</h3>
            <p className="text-white/80 mb-4">Get an accurate handicap calculation based on your rounds.</p>
            <div className="mt-auto">
              <Button variant="link" className="text-white p-0 hover:text-white/80">
                Learn more <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6 flex flex-col">
            <div className="bg-accent/20 rounded-full p-3 w-fit mb-4">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">🔹 Course Leaderboards</h3>
            <p className="text-white/80 mb-4">Compete with friends and other golfers at your favorite courses.</p>
            <div className="mt-auto">
              <Button variant="link" className="text-white p-0 hover:text-white/80">
                Learn more <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Call to action */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to take your game to the next level?</h2>
        <p className="text-xl text-white/90 mb-6">Sign up today and start tracking your journey to better golf!</p>
        <SignUpDialog />
      </div>
    </div>
  );
};
