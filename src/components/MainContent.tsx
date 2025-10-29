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
  return <div className="w-full mx-auto flex flex-col justify-between min-h-screen hero-background">
      <section aria-labelledby="hero-heading" className="hero-section flex-grow flex flex-col justify-center items-center px-4 py-6 text-left md:text-left">
        <div className="max-w-[680px] animate-fade-in mb-4 px-0 mx-auto hero-content">
          <h1 id="hero-heading" className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4 drop-shadow-lg">
            Every Round Tells a Story. Don't Let Yours Be Forgotten.
          </h1>
          <h3 className="text-base sm:text-lg md:text-xl text-white/95 font-medium mb-3 drop-shadow-md">
            Track your scores after you play—no apps on the course, no distractions—just pure golf and a permanent record of your journey, progress, and legacy.
          </h3>
          <p className="text-xs sm:text-sm text-white/80 mb-6 italic">
            Trusted by 1,000+ golfers already building their golf archive and climbing their course leaderboards.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Button 
              size="lg" 
              onClick={onStartSignup} 
              data-id="cta_hero_start_tracking"
              aria-label="Start tracking your golf rounds" 
              className="text-accent-foreground text-lg px-6 sm:px-8 h-auto py-3 shadow-lg transition-all duration-300 bg-secondary-foreground w-full sm:w-auto"
            >
              <UserPlus className="mr-2 h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm sm:text-base md:text-lg">Start Tracking My Rounds</span>
            </Button>
            <Link to="/demo" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                variant="outline" 
                data-id="cta_hero_watch_demo"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 px-6 sm:px-8 h-auto py-3 shadow-lg transition-all duration-300 w-full" 
                aria-label="Watch how MyBirdieBoard works"
              >
                <BarChart2 className="mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-sm sm:text-base md:text-lg">Watch How It Works</span>
              </Button>
            </Link>
          </div>
          
          {/* Micro trust row */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-white/90 mt-4">
            <div className="flex items-center gap-1.5">
              <span className="text-accent-foreground">✓</span>
              <span>No phone on the course</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-accent-foreground">✓</span>
              <span>Add rounds in seconds after you play</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-accent-foreground">✓</span>
              <span>Your golf history, saved forever</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Why MyBirdieBoard Exists */}
      <section aria-labelledby="why-heading" className="w-full max-w-5xl mx-auto px-4 pb-6">
        <h2 id="why-heading" className="text-2xl sm:text-3xl font-bold text-center text-white mb-4 drop-shadow-md">
          Why MyBirdieBoard Exists
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-white/90 text-center max-w-3xl mx-auto mb-6 bg-black/35 backdrop-blur-sm px-4 py-3 rounded-lg">
          Golf is more than a game—it's your personal journey. Paper scorecards get lost, and most apps distract you mid-round. MyBirdieBoard is the only distraction-free way to play with focus and still keep a powerful digital memory of every round afterward.
        </p>
        <div className="w-24 h-0.5 bg-white/30 mx-auto mb-8"></div>
      </section>
      
      <section aria-labelledby="features-heading" className="w-full max-w-5xl mx-auto px-4 pb-8">
        <h2 id="features-heading" className="sr-only">Key Features</h2>
        
        <div className="backdrop-blur-sm rounded-xl p-4 shadow-lg bg-black/35">
          <div className="flex flex-col lg:flex-row gap-6 justify-between">
            <div className="flex justify-center order-1 lg:justify-start lg:w-1/2 lg:order-1 mb-6 lg:mb-0">
              <img src="/lovable-uploads/cab862e7-c7cc-4446-9f24-b1c57c6531a0.png" alt="MyBirdieBoard App Screenshots" className="max-w-full h-auto object-contain rounded-lg" />
            </div>
            
            <div className="lg:w-1/2 order-2 lg:order-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  <CardContent className="p-3 flex flex-col h-full bg-stone-200 rounded-xl">
                    <div className="rounded-full p-2 w-fit mb-2 bg-[2f4c3d] bg-secondary-foreground">
                      <Upload className="h-4 w-4 text-white" aria-hidden="true" />
                    </div>
                    <h3 className="text-sm font-bold mb-2 text-secondary-foreground">Keep a permanent digital record of every round</h3>
                    <p className="mb-2 text-xs text-secondary-foreground">Upload in seconds after you play—no more lost scorecards.</p>
                    <div className="mt-auto pt-1">
                      <Button variant="link" onClick={() => handleOpenFeatureInfo(featureInfo.scorecards)} aria-label="Learn more about round archives" className="p-0 text-xs text-secondary-foreground">
                        Learn More <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  <CardContent className="p-3 flex flex-col h-full bg-stone-200 rounded-xl">
                    <div className="rounded-full p-2 w-fit mb-2 bg-secondary-foreground bg-[2f4c3d]">
                      <BarChart2 className="h-4 w-4 text-white" aria-hidden="true" />
                    </div>
                    <h3 className="text-sm font-bold mb-2 text-secondary-foreground">See exactly where you're gaining and losing strokes</h3>
                    <p className="mb-2 text-xs text-secondary-foreground">Clear charts show trends, so you know what to practice next.</p>
                    <div className="mt-auto pt-1">
                      <Button variant="link" onClick={() => handleOpenFeatureInfo(featureInfo.progress)} aria-label="Learn more about progress analytics" className="p-0 text-xs text-secondary-foreground">
                        Learn More <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  <CardContent className="p-3 flex flex-col h-full bg-stone-200 rounded-xl">
                    <div className="rounded-full p-2 w-fit mb-2 bg-secondary-foreground">
                      <Award className="h-4 w-4 text-white" aria-hidden="true" />
                    </div>
                    <h3 className="text-sm font-bold mb-2 text-secondary-foreground">Watch your handicap drop over time</h3>
                    <p className="mb-2 text-xs text-secondary-foreground">Your index updates as you add rounds.</p>
                    <div className="mt-auto pt-1 bg-transparent">
                      <Button variant="link" onClick={() => handleOpenFeatureInfo(featureInfo.handicap)} aria-label="Learn more about handicap tracking" className="p-0 text-xs text-secondary-foreground">
                        Learn More <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  <CardContent className="p-3 flex flex-col h-full bg-stone-200 rounded-xl">
                    <div className="rounded-full p-2 w-fit mb-2 bg-[2f4c3d] bg-secondary-foreground">
                      <Trophy className="h-4 w-4 text-white" aria-hidden="true" />
                    </div>
                    <h3 className="text-sm font-bold mb-2 text-secondary-foreground">Compete on course leaderboards</h3>
                    <p className="mb-2 text-xs text-secondary-foreground">Find your rank at your home course and chase the top spot.</p>
                    <div className="mt-auto pt-1">
                      <Button variant="link" onClick={() => handleOpenFeatureInfo(featureInfo.leaderboards)} aria-label="Learn more about leaderboards" className="p-0 text-xs text-secondary-foreground">
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
      
      {/* CTA Reinforcement Strip */}
      <section aria-labelledby="cta-heading" className="w-full py-6 sm:py-8 bg-black/40 backdrop-blur-sm mt-2 sm:mt-3">
        <div className="max-w-5xl mx-auto text-center px-4">
          <h2 id="cta-heading" className="text-xl sm:text-2xl font-bold text-white mb-4">
            Play with focus. Track with purpose. Improve with clarity.
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={onStartSignup} 
              data-id="cta_strip_start_free"
              aria-label="Start free with MyBirdieBoard" 
              className="text-accent-foreground text-base px-8 h-auto py-3 shadow-lg transition-all duration-300 bg-secondary-foreground w-full sm:w-auto"
            >
              <UserPlus className="mr-2 h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm sm:text-base">Start Free</span>
            </Button>
            <Link to="/demo" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 px-8 h-auto py-3 shadow-lg transition-all duration-300 w-full" 
                aria-label="View demo dashboard"
              >
                <BarChart2 className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="text-sm sm:text-base">Try Demo</span>
              </Button>
            </Link>
            <Link to="/faq" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 px-8 h-auto py-3 shadow-lg transition-all duration-300 w-full" 
                aria-label="View frequently asked questions"
              >
                <HelpCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="text-sm sm:text-base">FAQ</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <FeatureInfoModal isOpen={!!selectedFeature} onClose={handleCloseFeatureInfo} feature={selectedFeature} />
    </div>;
};