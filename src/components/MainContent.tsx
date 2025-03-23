import React, { useState } from 'react';
import { Button } from './ui/button';
import { ArrowRight, Upload, BarChart2, Award, Trophy, HelpCircle, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { FeatureInfoModal, FeatureInfo } from './FeatureInfoModal';
interface MainContentProps {
  onStartSignup: () => void;
}
export const MainContent = ({
  onStartSignup
}: MainContentProps) => {
  const [selectedFeature, setSelectedFeature] = useState<FeatureInfo | null>(null);
  const featureInfo: Record<string, FeatureInfo> = {
    scorecards: {
      title: "Upload & Store Your Scorecards",
      icon: <Upload className="h-3 w-3 sm:h-4 sm:w-4 text-white" aria-hidden="true" />,
      description: <div className="space-y-4 pt-2">
          <p>Never lose track of your rounds again! With MyBirdieBoard, you can upload your scorecards effortlessly and keep a complete history of every round you play. Whether you're tracking personal bests or looking for trends in your game, your entire golf journey is stored in one place.</p>
          
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-accent mr-2 flex-shrink-0 w-5">🔹</span>
              <span className="flex-1">Log every round played</span>
            </li>
            <li className="flex items-start">
              <span className="text-accent mr-2 flex-shrink-0 w-5">🔹</span>
              <span className="flex-1">View past performances anytime</span>
            </li>
            <li className="flex items-start">
              <span className="text-accent mr-2 flex-shrink-0 w-5">🔹</span>
              <span className="flex-1">Keep all your scores safe and organized</span>
            </li>
          </ul>
          
          <p className="font-medium">Start tracking today and take control of your game!</p>
        </div>
    },
    progress: {
      title: "Visual Progress Tracking",
      icon: <BarChart2 className="h-3 w-3 sm:h-4 sm:w-4 text-white" aria-hidden="true" />,
      description: <div className="space-y-4 pt-2">
          <p>See your improvement in real-time! MyBirdieBoard gives you in-depth insights into your game with easy-to-read charts and graphs. Spot trends, analyze your strengths, and identify areas to improve so you can play smarter, not harder.</p>
          
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-accent mr-2 flex-shrink-0 w-5">🔹</span>
              <span className="flex-1">Track scoring trends over time</span>
            </li>
            <li className="flex items-start">
              <span className="text-accent mr-2 flex-shrink-0 w-5">🔹</span>
              <span className="flex-1">Identify your strongest and weakest holes</span>
            </li>
            <li className="flex items-start">
              <span className="text-accent mr-2 flex-shrink-0 w-5">🔹</span>
              <span className="flex-1">Set goals and measure your progress</span>
            </li>
          </ul>
          
          <p className="font-medium">Know your game. Improve your game.</p>
        </div>
    },
    handicap: {
      title: "Handicap Generator",
      icon: <Award className="h-3 w-3 sm:h-4 sm:w-4 text-white" aria-hidden="true" />,
      description: <div className="space-y-4 pt-2">
          <p>Get a reliable, data-driven handicap that reflects your true skill level. MyBirdieBoard calculates your handicap using official methods, so you always have an accurate measure of your performance—perfect for friendly competition or self-improvement.</p>
          
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-accent mr-2 flex-shrink-0 w-5">🔹</span>
              <span className="flex-1">Automatically updated after each round</span>
            </li>
            <li className="flex items-start">
              <span className="text-accent mr-2 flex-shrink-0 w-5">🔹</span>
              <span className="flex-1">See how your handicap improves over time</span>
            </li>
            <li className="flex items-start">
              <span className="text-accent mr-2 flex-shrink-0 w-5">🔹</span>
              <span className="flex-1">Play on a level field with golfers of all skill levels</span>
            </li>
          </ul>
          
          <p className="font-medium">Start tracking your handicap today!</p>
        </div>
    },
    leaderboards: {
      title: "Course Leaderboards",
      icon: <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-white" aria-hidden="true" />,
      description: <div className="space-y-4 pt-2">
          <p>Golf is better with a little competition! MyBirdieBoard's Course Leaderboards let you compare your scores with other golfers at the same course—whether you play together or not. Climb the rankings, challenge your friends, and set new personal bests.</p>
          
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-accent mr-2 flex-shrink-0 w-5">🔹</span>
              <span className="flex-1">View leaderboard rankings by course</span>
            </li>
            <li className="flex items-start">
              <span className="text-accent mr-2 flex-shrink-0 w-5">🔹</span>
              <span className="flex-1">Compare gross and net scores</span>
            </li>
            <li className="flex items-start">
              <span className="text-accent mr-2 flex-shrink-0 w-5">🔹</span>
              <span className="flex-1">Challenge friends, even if you're not playing together</span>
            </li>
          </ul>
          
          <p className="font-medium">Who will top the leaderboard? Join today and find out!</p>
        </div>
    }
  };
  const handleOpenFeatureInfo = (feature: FeatureInfo) => {
    setSelectedFeature(feature);
  };
  const handleCloseFeatureInfo = () => {
    setSelectedFeature(null);
  };
  return <div className="w-full mx-auto flex flex-col justify-between min-h-screen">
      <section aria-labelledby="hero-heading" className="flex-grow flex flex-col justify-center items-center px-4 py-6 text-center mt-4 sm:mt-0">
        <div className="max-w-5xl mx-auto animate-fade-in mb-4">
          <h1 id="hero-heading" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-8 drop-shadow-md">
            Track Your Rounds. Lower Your Scores. Play Smarter.
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 font-medium mb-8 max-w-3xl mx-auto 
            bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg">Welcome to MyBirdieBoard – Your post-round golf tracker. Play first, track later.</p>
          
          <div className="flex justify-center mt-6">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 h-12 shadow-lg transition-all duration-300" onClick={onStartSignup} aria-label="Sign up for MyBirdieBoard">
              <UserPlus className="mr-2 h-5 w-5" aria-hidden="true" />
              START YOUR FREE TRIAL TODAY!
            </Button>
          </div>
        </div>
      </section>
      
      <section aria-labelledby="features-heading" className="w-full max-w-5xl mx-auto px-4 pb-8">
        <h2 id="features-heading" className="sr-only">MyBirdieBoard Features</h2>
        
        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-6 justify-between">
            <div className="flex justify-center order-1 lg:justify-start lg:w-1/2 lg:order-1 mb-6 lg:mb-0">
              <img src="/lovable-uploads/cab862e7-c7cc-4446-9f24-b1c57c6531a0.png" alt="MyBirdieBoard App Screenshots" className="max-w-full h-auto object-contain rounded-lg" />
            </div>
            
            <div className="lg:w-1/2 order-2 lg:order-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  <CardContent className="p-3 flex flex-col h-full bg-stone-200 rounded-2xl">
                    <div className="rounded-full p-2 w-fit mb-2 bg-[2f4c3d] bg-[#2f4c3d]">
                      <Upload className="h-4 w-4 text-white" aria-hidden="true" />
                    </div>
                    <h3 className="text-sm font-bold mb-2 text-secondary-foreground">Upload & Store Your Scorecards</h3>
                    <p className="mb-2 text-xs text-secondary-foreground">Keep a history of your rounds and track stats effortlessly.</p>
                    <div className="mt-auto pt-1">
                      <Button variant="link" onClick={() => handleOpenFeatureInfo(featureInfo.scorecards)} aria-label="Learn more about scorecard uploads" className="p-0 text-xs text-secondary-foreground">
                        Learn More <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  <CardContent className="p-3 flex flex-col h-full bg-stone-200 rounded-2xl">
                    <div className="rounded-full p-2 w-fit mb-2 bg-secondary-foreground bg-[2f4c3d]">
                      <BarChart2 className="h-4 w-4 text-white" aria-hidden="true" />
                    </div>
                    <h3 className="text-sm font-bold mb-2 text-secondary-foreground">Visual Progress Tracking</h3>
                    <p className="mb-2 text-xs text-secondary-foreground">Charts and graphs give you insights into your strengths and areas to improve.</p>
                    <div className="mt-auto pt-1">
                      <Button variant="link" onClick={() => handleOpenFeatureInfo(featureInfo.progress)} aria-label="Learn more about progress tracking" className="p-0 text-xs text-secondary-foreground">
                        Learn More <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  <CardContent className="p-3 flex flex-col h-full">
                    <div className="bg-accent/20 rounded-full p-2 w-fit mb-2">
                      <Award className="h-4 w-4 text-white" aria-hidden="true" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">Handicap Generator</h3>
                    <p className="text-white/80 mb-2 text-xs">Get an accurate handicap calculation based on your rounds.</p>
                    <div className="mt-auto pt-1">
                      <Button variant="link" className="text-white p-0 hover:text-white/80 text-xs" onClick={() => handleOpenFeatureInfo(featureInfo.handicap)} aria-label="Learn more about handicap calculation">
                        Learn More <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  <CardContent className="p-3 flex flex-col h-full">
                    <div className="bg-accent/20 rounded-full p-2 w-fit mb-2">
                      <Trophy className="h-4 w-4 text-white" aria-hidden="true" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">Course Leaderboards</h3>
                    <p className="text-white/80 mb-2 text-xs">Compete with friends and other golfers at your favorite courses.</p>
                    <div className="mt-auto pt-1">
                      <Button variant="link" className="text-white p-0 hover:text-white/80 text-xs" onClick={() => handleOpenFeatureInfo(featureInfo.leaderboards)} aria-label="Learn more about course leaderboards">
                        Learn More <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section aria-labelledby="cta-heading" className="w-full py-4 sm:py-6 bg-black/30 backdrop-blur-sm mt-2 sm:mt-3">
        <div className="max-w-5xl mx-auto text-center px-4">
          <h2 id="cta-heading" className="text-lg sm:text-xl font-bold text-white mb-2">Ready to take your game to the next level?</h2>
          <p className="text-sm sm:text-base text-white/90 mb-3">Find out how MyBirdieBoard can help improve your golf game!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 h-12 shadow-lg transition-all duration-300" onClick={onStartSignup} aria-label="Sign up for MyBirdieBoard">
              <UserPlus className="mr-2 h-5 w-5" aria-hidden="true" />
              Sign up
            </Button>
            <Link to="/faq">
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white px-8 h-12 shadow-lg transition-all duration-300" aria-label="View frequently asked questions">
                <HelpCircle className="mr-2 h-4 w-4" />
                Read FAQ
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <FeatureInfoModal isOpen={!!selectedFeature} onClose={handleCloseFeatureInfo} feature={selectedFeature} />
    </div>;
};