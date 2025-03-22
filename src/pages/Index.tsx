
import { useState } from "react";
import { MainContent } from "@/components/MainContent";
import { LoginDialog } from "@/components/LoginDialog";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SocialFooter } from "@/components/SocialFooter";
import { SignUpDialog } from "@/components/SignUpDialog";
import { UserReviews } from "@/components/UserReviews";

const Index = () => {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showSignupDialog, setShowSignupDialog] = useState(false);

  const handleStartSignup = () => {
    setShowSignupDialog(true);
  };

  return (
    <>
      <Helmet>
        <title>MyBirdieBoard - Golf Score Tracking & Performance Analytics</title>
        <meta name="description" content="Track your golf scores, challenge friends on course leaderboards, and improve your game with detailed performance analytics on MyBirdieBoard" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <div 
          className="relative flex-1 bg-cover bg-center bg-no-repeat overflow-hidden"
          style={{
            backgroundImage: `url('/lovable-uploads/a97d328d-b4a2-4af3-b073-8d4b085c4dda.png')`,
            backgroundColor: "#2C4A3B", // Fallback color if image fails to load
          }}
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black opacity-10 z-0" aria-hidden="true"></div>
          
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
                  className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all text-xs sm:text-sm py-1"
                  aria-label="Log in to your account"
                >
                  <User className="mr-1 h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                  Log In
                </Button>
              </nav>
            </div>
          </header>
          
          {/* Main hero and feature section */}
          <main className="relative z-[1] pt-32 sm:pt-16 w-full text-center">
            <div className="container mx-auto px-4">
              {/* Hero section */}
              <div className="max-w-5xl mx-auto mb-12 animate-fade-in">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-8 drop-shadow-md">
                  Track Your Rounds. Lower Your Scores. Play Smarter.
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 font-medium mb-8 max-w-3xl mx-auto 
                  bg-black/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  Welcome to MyBirdieBoard – the ultimate golf tracking platform to help you improve every round.
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
              
              {/* Features with device screens section */}
              <div className="max-w-7xl mx-auto bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-xl">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  {/* Device screens image */}
                  <div className="lg:w-1/2 flex justify-center mb-8 lg:mb-0">
                    <img 
                      src="/lovable-uploads/a5adf299-888e-4978-b68a-627952aafd47.png" 
                      alt="MyBirdieBoard on laptop and mobile" 
                      className="w-full max-w-md lg:max-w-lg object-contain rounded-lg shadow-2xl"
                    />
                  </div>
                  
                  {/* 2x2 Feature boxes */}
                  <div className="lg:w-1/2">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center lg:text-left">Key Features</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {/* Feature 1 */}
                      <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="bg-accent/20 rounded-full p-2 w-fit mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Upload & Store Your Scorecards</h3>
                        <p className="text-white/80 mb-2 text-sm">Keep a history of your rounds and track stats effortlessly.</p>
                      </div>
                      
                      {/* Feature 2 */}
                      <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="bg-accent/20 rounded-full p-2 w-fit mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Visual Progress Tracking</h3>
                        <p className="text-white/80 mb-2 text-sm">Charts and graphs give you insights into your strengths and areas to improve.</p>
                      </div>
                      
                      {/* Feature 3 */}
                      <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="bg-accent/20 rounded-full p-2 w-fit mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Handicap Generator</h3>
                        <p className="text-white/80 mb-2 text-sm">Get an accurate handicap calculation based on your rounds.</p>
                      </div>
                      
                      {/* Feature 4 */}
                      <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="bg-accent/20 rounded-full p-2 w-fit mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Course Leaderboards</h3>
                        <p className="text-white/80 mb-2 text-sm">Compete with friends and other golfers at your favorite courses.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
          
          {/* Call to action - Secondary Banner */}
          <section aria-labelledby="cta-heading" className="w-full py-8 sm:py-12 bg-black/30 backdrop-blur-sm mt-12">
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
          
          {/* Add the UserReviews component */}
          <UserReviews />
        </div>
        <SocialFooter />
        <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
        <SignUpDialog 
          open={showSignupDialog} 
          onOpenChange={setShowSignupDialog}
        />
      </div>
    </>
  );
};

export default Index;
