
import React from 'react';
import { Button } from './ui/button';
import { HelpCircle, Trophy, ArrowRight, Calendar, Golf } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SignUpDialog } from './SignUpDialog';
import { Card, CardContent } from './ui/card';

export const MainContent = () => {
  return (
    <div className="w-full max-w-5xl mx-auto text-center px-4 py-16">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-6xl font-bold text-white tracking-tight mb-6 drop-shadow-md">
          Your Golf Journey <br />Starts Here
        </h1>
        <p className="text-xl text-white/90 font-medium mb-10 max-w-2xl mx-auto">
          Track your scores, monitor your progress, and connect with golfers worldwide using BirdieBoard's powerful cloud platform.
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
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6 flex flex-col">
            <div className="bg-accent/20 rounded-full p-3 w-fit mb-4">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Track Your Progress</h3>
            <p className="text-white/80 mb-4">Monitor your scores, track handicap changes, and see your improvement over time with detailed analytics.</p>
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
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Manage Rounds</h3>
            <p className="text-white/80 mb-4">Schedule games, invite friends, and keep a complete history of all your rounds at courses worldwide.</p>
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
            <h3 className="text-xl font-bold text-white mb-2">Join Competitions</h3>
            <p className="text-white/80 mb-4">Compete with friends or join global leaderboards to test your skills against golfers worldwide.</p>
            <div className="mt-auto">
              <Button variant="link" className="text-white p-0 hover:text-white/80">
                Learn more <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
