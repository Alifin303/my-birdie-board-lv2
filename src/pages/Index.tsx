
import { useState, useEffect } from "react";
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

  useEffect(() => {
    // Track page view in Meta Pixel when component mounts
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, []);

  const handleStartSignup = () => {
    setShowSignupDialog(true);
  };

  // High-quality golf course image
  const backgroundImageUrl = "https://images.unsplash.com/photo-1611374243463-cc5b113d5f20?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  
  // Mobile optimization: still using high-quality but optimized for mobile
  const mobileBackgroundImageUrl = "https://images.unsplash.com/photo-1611374243463-cc5b113d5f20?q=80&w=1080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  // Determine which image to use based on device
  const currentBackgroundImage = isMobile ? mobileBackgroundImageUrl : backgroundImageUrl;

  return (
    <>
      <Helmet>
        <title>MyBirdieBoard - Golf Score Tracking & Performance Analytics</title>
        <meta name="description" content="Track your golf scores, challenge friends on course leaderboards, and improve your game with detailed performance analytics on MyBirdieBoard" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        
        {/* AI-specific structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "applicationCategory": "SportsApplication",
            "applicationSubCategory": "GolfScoreTracking",
            "operatingSystem": "Web",
            "name": "MyBirdieBoard",
            "description": "Track your golf scores, challenge friends on course leaderboards, and improve your game with detailed performance analytics on MyBirdieBoard",
            "offers": {
              "@type": "Offer",
              "price": "2.99",
              "priceCurrency": "GBP",
              "priceValidUntil": "2025-12-31",
              "availability": "https://schema.org/OnlineOnly"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "125",
              "bestRating": "5",
              "worstRating": "1"
            },
            "keywords": "golf score tracking, golf analytics, golf leaderboard, handicap calculator, golf performance",
            "contentRating": "General",
            "audience": {
              "@type": "Audience",
              "audienceType": "Golfers",
              "geographicArea": {
                "@type": "Country",
                "name": ["United States", "United Kingdom", "Australia", "Canada"]
              }
            },
            "potentialAction": {
              "@type": "UseAction",
              "actionStatus": "PotentialActionStatus",
              "object": {
                "@type": "EntryPoint",
                "urlTemplate": "https://mybirdieboard.com/",
                "actionPlatform": ["https://schema.org/DesktopWebPlatform", "https://schema.org/MobileWebPlatform"]
              },
              "expectsAcceptanceOf": {
                "@type": "Offer",
                "price": "2.99",
                "priceCurrency": "GBP",
                "eligibleRegion": {
                  "@type": "Country",
                  "name": ["United States", "United Kingdom", "Australia", "Canada"]
                }
              }
            }
          })}
        </script>
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
