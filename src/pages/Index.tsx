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
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const isMobile = useIsMobile();

  const handleStartSignup = () => {
    setShowSignupDialog(true);
  };

  // High-quality golf course image
  const backgroundImageUrl = "https://images.unsplash.com/photo-1600112356915-089a395af9d7?q=80&w=2070&auto=format&fit=crop";
  
  // Mobile optimization: load a smaller but still high-quality image for mobile
  const mobileBackgroundImageUrl = "https://images.unsplash.com/photo-1600112356915-089a395af9d7?q=80&w=1080&auto=format&fit=crop";

  // Determine which image to use based on device
  const currentBackgroundImage = isMobile ? mobileBackgroundImageUrl : backgroundImageUrl;

  return (
    <>
      <Helmet>
        <title>MyBirdieBoard - Golf Score Tracking & Performance Analytics</title>
        <meta name="description" content="Track your golf scores, challenge friends on course leaderboards, and improve your game with detailed performance analytics on MyBirdieBoard" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <div 
          className="relative flex-1 overflow-hidden"
          style={{
            backgroundImage: `url('${currentBackgroundImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundColor: "#2C4A3B", // Fallback color
            backgroundAttachment: isMobile ? "scroll" : "fixed", // Better performance on mobile
          }}
        >
          {/* Dark overlay with improved opacity for better text contrast */}
          <div 
            className="absolute inset-0 bg-black z-0" 
            style={{ opacity: 0.25 }}
            aria-hidden="true"
          ></div>
          
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
            
            {/* Add the UserReviews component */}
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

