
import { useState } from "react";
import { LoginDialog } from "@/components/LoginDialog";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SocialFooter } from "@/components/SocialFooter";
import { SignUpDialog } from "@/components/SignUpDialog";
import { UserReviews } from "@/components/UserReviews";
import { FeatureInfoModal, FeatureInfo } from "@/components/FeatureInfoModal";
import { Upload, BarChart2, Award, Trophy } from "lucide-react";

const Index = () => {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<FeatureInfo | null>(null);

  const handleStartSignup = () => {
    setShowSignupDialog(true);
  };

  const featureInfo: Record<string, FeatureInfo> = {
    scorecards: {
      title: "Upload & Store Your Scorecards",
      icon: <Upload className="h-4 w-4 text-white" />,
      description: (
        <div className="space-y-4 pt-2">
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
      )
    },
    progress: {
      title: "Visual Progress Tracking",
      icon: <BarChart2 className="h-4 w-4 text-white" />,
      description: (
        <div className="space-y-4 pt-2">
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
      )
    },
    handicap: {
      title: "Handicap Generator",
      icon: <Award className="h-4 w-4 text-white" />,
      description: (
        <div className="space-y-4 pt-2">
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
      )
    },
    leaderboards: {
      title: "Course Leaderboards",
      icon: <Trophy className="h-4 w-4 text-white" />,
      description: (
        <div className="space-y-4 pt-2">
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
      )
    }
  };

  const handleOpenFeatureInfo = (feature: FeatureInfo) => {
    setSelectedFeature(feature);
  };

  const handleCloseFeatureInfo = () => {
    setSelectedFeature(null);
  };

  return (
    <>
      <Helmet>
        <title>MyBirdieBoard - Golf Score Tracking & Performance Analytics</title>
        <meta name="description" content="Track your golf scores, challenge friends on course leaderboards, and improve your game with detailed performance analytics on MyBirdieBoard" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        {/* Background image container with full visibility */}
        <div 
          className="relative flex-1 overflow-hidden"
          style={{
            backgroundImage: `url('/lovable-uploads/1c2fceba-4dfb-4bc2-827e-3ac79748f0a3.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 0
          }}
        >
          {/* No overlay div - removed to show full background image */}
          
          <header className="absolute top-0 left-0 right-0 z-10">
            <div className="container mx-auto px-4 py-2">
              <nav className="flex items-center justify-between">
                <Link to="/" className="flex items-center" aria-label="MyBirdieBoard Home">
                  <img 
                    src="/lovable-uploads/e65e4018-8608-4c06-aefc-191f9e9de8e0.png" 
                    alt="MyBirdieBoard Logo" 
                    className="h-32 w-auto object-contain" 
                  />
                </Link>
                <Button 
                  onClick={() => setShowLoginDialog(true)}
                  variant="ghost" 
                  className="bg-white/30 backdrop-blur-sm text-white hover:bg-white/40 transition-all text-xs sm:text-sm py-1"
                  aria-label="Log in to your account"
                >
                  <User className="mr-1 h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                  Log In
                </Button>
              </nav>
            </div>
          </header>
          
          <main className="relative z-[1] pt-32 sm:pt-16 w-full text-center">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto mb-12 animate-fade-in">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-8 drop-shadow-md">
                  Track Your Rounds. Lower Your Scores. Play Smarter.
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 font-medium mb-8 max-w-3xl mx-auto 
                  bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg">
                  Welcome to MyBirdieBoard – Your post-round golf tracker. Play first, track later.
                </p>
                
                <div className="flex justify-center mt-6 mb-12">
                  <Button 
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 h-12 shadow-lg transition-all duration-300"
                    onClick={handleStartSignup}
                    aria-label="Sign up for MyBirdieBoard"
                  >
                    START YOUR FREE TRIAL TODAY!
                  </Button>
                </div>
              </div>
              
              <div className="max-w-7xl mx-auto bg-white/20 backdrop-blur-md p-6 sm:p-8 rounded-xl">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="lg:w-1/2 flex justify-center mb-8 lg:mb-0">
                    <img 
                      src="/lovable-uploads/a5adf299-888e-4978-b68a-627952aafd47.png" 
                      alt="MyBirdieBoard on laptop and mobile" 
                      className="w-full max-w-md lg:max-w-lg object-contain rounded-lg"
                    />
                  </div>
                  
                  <div className="lg:w-1/2">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center lg:text-left">Key Features</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-white/30 backdrop-blur-sm p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="bg-accent/20 rounded-full p-2 w-fit mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Upload & Store Your Scorecards</h3>
                        <p className="text-white/90 mb-2 text-sm">Keep a history of your rounds and track stats effortlessly.</p>
                        <Button 
                          variant="link" 
                          className="text-white p-0 hover:text-white/80 text-sm"
                          onClick={() => handleOpenFeatureInfo(featureInfo.scorecards)}
                          aria-label="Learn more about scorecard uploads"
                        >
                          Learn More
                        </Button>
                      </div>
                      
                      <div className="bg-white/30 backdrop-blur-sm p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="bg-accent/20 rounded-full p-2 w-fit mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Visual Progress Tracking</h3>
                        <p className="text-white/90 mb-2 text-sm">Charts and graphs give you insights into your strengths and areas to improve.</p>
                        <Button 
                          variant="link" 
                          className="text-white p-0 hover:text-white/80 text-sm"
                          onClick={() => handleOpenFeatureInfo(featureInfo.progress)}
                          aria-label="Learn more about progress tracking"
                        >
                          Learn More
                        </Button>
                      </div>
                      
                      <div className="bg-white/30 backdrop-blur-sm p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="bg-accent/20 rounded-full p-2 w-fit mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Handicap Generator</h3>
                        <p className="text-white/90 mb-2 text-sm">Get an accurate handicap calculation based on your rounds.</p>
                        <Button 
                          variant="link" 
                          className="text-white p-0 hover:text-white/80 text-sm"
                          onClick={() => handleOpenFeatureInfo(featureInfo.handicap)}
                          aria-label="Learn more about handicap calculation"
                        >
                          Learn More
                        </Button>
                      </div>
                      
                      <div className="bg-white/30 backdrop-blur-sm p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="bg-accent/20 rounded-full p-2 w-fit mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Course Leaderboards</h3>
                        <p className="text-white/90 mb-2 text-sm">Compete with friends and other golfers at your favorite courses.</p>
                        <Button 
                          variant="link" 
                          className="text-white p-0 hover:text-white/80 text-sm"
                          onClick={() => handleOpenFeatureInfo(featureInfo.leaderboards)}
                          aria-label="Learn more about course leaderboards"
                        >
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
          
          <section aria-labelledby="cta-heading" className="w-full py-8 sm:py-12 bg-white/10 backdrop-blur-sm mt-12">
            <div className="max-w-5xl mx-auto text-center px-4">
              <h2 id="cta-heading" className="text-xl sm:text-2xl font-bold text-white mb-4">Ready to take your game to the next level?</h2>
              <p className="text-base sm:text-lg text-white/90 mb-6">Find out how MyBirdieBoard can help improve your golf game!</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 h-12 shadow-lg transition-all duration-300"
                  onClick={handleStartSignup}
                  aria-label="Sign up for MyBirdieBoard"
                >
                  START YOUR FREE TRIAL
                </Button>
              </div>
            </div>
          </section>
          
          <UserReviews />
        </div>
        <SocialFooter />
        <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
        <SignUpDialog 
          open={showSignupDialog} 
          onOpenChange={setShowSignupDialog}
        />
        <FeatureInfoModal 
          isOpen={!!selectedFeature}
          onClose={handleCloseFeatureInfo}
          feature={selectedFeature}
        />
      </div>
    </>
  );
};

export default Index;
