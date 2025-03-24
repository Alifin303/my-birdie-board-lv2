
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
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleStartSignup = () => {
    setShowSignupDialog(true);
  };

  const handleImageLoad = () => {
    console.log("Background image loaded successfully");
    setImageLoaded(true);
  };

  const handleImageError = (e) => {
    console.error("Background image failed to load:", e);
    setImageLoaded(false);
  };

  // The backgroundImageUrl should use the direct path to the uploaded image
  const backgroundImageUrl = "/lovable-uploads/997e24ca-24e2-4970-b610-227abf092928.png";

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
            backgroundImage: `url('${backgroundImageUrl}')`,
            backgroundColor: "#2C4A3B", // Fallback color if image fails to load
          }}
        >
          {/* This is a hidden image that helps us detect if the image loaded correctly */}
          <img 
            src={backgroundImageUrl}
            alt="Background Check" 
            style={{ display: 'none' }} 
            onLoad={handleImageLoad} 
            onError={handleImageError}
          />
          
          <div className="absolute inset-0 bg-black opacity-20 z-0" aria-hidden="true"></div>
          
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
          <main className="relative z-[1] pt-32 sm:pt-0 w-full text-center sm:text-left"> 
            <MainContent onStartSignup={handleStartSignup} />
            
            <UserReviews />
          </main>
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
