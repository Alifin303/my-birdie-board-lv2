
import React from 'react';
import { Button } from './ui/button';
import { ArrowRight, Upload, BarChart2, Award, Trophy, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';

interface MainContentProps {
  onStartQuiz: () => void;
}

export const MainContent = ({ onStartQuiz }: MainContentProps) => {
  return (
    <div className="w-full mx-auto flex flex-col justify-between min-h-screen">
      {/* Hero Section - Added mobile padding */}
      <section aria-labelledby="hero-heading" className="flex-grow flex flex-col justify-center items-center px-4 py-6 text-center mt-4 sm:mt-0">
        <div className="max-w-5xl mx-auto animate-fade-in mb-4">
          <h1 id="hero-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4 drop-shadow-md">
            Welcome to MyBirdieBoard – <br className="hidden sm:block" />Your Ultimate Golf Tracking Hub!
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-white/90 font-medium mb-6 max-w-3xl mx-auto">
            MyBirdieBoard is the all-in-one platform for golfers looking to track progress, analyze performance, and compete on leaderboards. Whether you're a casual weekend golfer or a dedicated player chasing lower scores, MyBirdieBoard helps you upload scorecards, track your handicap, and see your game improve over time.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
            <Button 
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 h-12 shadow-lg transition-all duration-300"
              onClick={onStartQuiz}
              aria-label="Get started with MyBirdieBoard"
            >
              <span className="mr-2" aria-hidden="true">🏌️‍♂️</span>
              Get started
            </Button>
            <Link to="/faq">
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 text-white px-8 h-12 shadow-lg transition-all duration-300"
                aria-label="View frequently asked questions"
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                Read FAQ
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section - Reduced padding and card heights */}
      <section aria-labelledby="features-heading" className="w-full max-w-5xl mx-auto px-4 pb-8">
        <h2 id="features-heading" className="sr-only">MyBirdieBoard Features</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-left justify-center">
          <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
            <CardContent className="p-2 sm:p-3 flex flex-col h-full">
              <div className="bg-accent/20 rounded-full p-2 w-fit mb-1">
                <Upload className="h-3 w-3 sm:h-4 sm:w-4 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white mb-1">Upload & Store Your Scorecards</h3>
              <p className="text-white/80 mb-1 text-xs hidden sm:block">Keep a history of your rounds and track stats effortlessly.</p>
              <div className="mt-auto pt-1">
                <Link to="/about" aria-label="Learn more about scorecard uploads">
                  <Button 
                    variant="link" 
                    className="text-white p-0 hover:text-white/80 text-xs"
                  >
                    Learn More <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
            <CardContent className="p-2 sm:p-3 flex flex-col h-full">
              <div className="bg-accent/20 rounded-full p-2 w-fit mb-1">
                <BarChart2 className="h-3 w-3 sm:h-4 sm:w-4 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white mb-1">Visual Progress Tracking</h3>
              <p className="text-white/80 mb-1 text-xs hidden sm:block">Charts and graphs give you insights into your strengths and areas to improve.</p>
              <div className="mt-auto pt-1">
                <Link to="/about" aria-label="Learn more about progress tracking">
                  <Button 
                    variant="link" 
                    className="text-white p-0 hover:text-white/80 text-xs"
                  >
                    Learn More <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
            <CardContent className="p-2 sm:p-3 flex flex-col h-full">
              <div className="bg-accent/20 rounded-full p-2 w-fit mb-1">
                <Award className="h-3 w-3 sm:h-4 sm:w-4 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white mb-1">Handicap Generator</h3>
              <p className="text-white/80 mb-1 text-xs hidden sm:block">Get an accurate handicap calculation based on your rounds.</p>
              <div className="mt-auto pt-1">
                <Link to="/about" aria-label="Learn more about handicap calculation">
                  <Button 
                    variant="link" 
                    className="text-white p-0 hover:text-white/80 text-xs"
                  >
                    Learn More <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
            <CardContent className="p-2 sm:p-3 flex flex-col h-full">
              <div className="bg-accent/20 rounded-full p-2 w-fit mb-1">
                <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white mb-1">Course Leaderboards</h3>
              <p className="text-white/80 mb-1 text-xs hidden sm:block">Compete with friends and other golfers at your favorite courses.</p>
              <div className="mt-auto pt-1">
                <Link to="/about" aria-label="Learn more about course leaderboards">
                  <Button 
                    variant="link" 
                    className="text-white p-0 hover:text-white/80 text-xs"
                  >
                    Learn More <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Call to action - Secondary Banner */}
      <section aria-labelledby="cta-heading" className="w-full py-4 sm:py-6 bg-black/30 backdrop-blur-sm mt-2 sm:mt-3">
        <div className="max-w-5xl mx-auto text-center px-4">
          <h2 id="cta-heading" className="text-lg sm:text-xl font-bold text-white mb-2">Ready to take your game to the next level?</h2>
          <p className="text-sm sm:text-base text-white/90 mb-3">Find out how MyBirdieBoard can help improve your golf game!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 h-12 shadow-lg transition-all duration-300"
              onClick={onStartQuiz}
              aria-label="Start the improvement quiz"
            >
              <span className="mr-2" aria-hidden="true">🏌️‍♂️</span>
              Get started
            </Button>
            <Link to="/faq">
              <Button 
                variant="link" 
                className="text-white hover:text-white/80"
                aria-label="View our FAQ page"
              >
                Got questions? Check our FAQ
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
