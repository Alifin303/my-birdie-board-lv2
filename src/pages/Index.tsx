
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
import { GolfResourcesSection } from "@/components/GolfResourcesSection";
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
        <title>Best Golf Score Tracking App for Beginners - Calculate Golf Handicap Step by Step | MyBirdieBoard</title>
        <meta name="description" content="The best golf score tracking app for beginners and pros. Learn how to calculate golf handicap step by step, track golf scores effectively, analyze performance with golf analytics, and compete on course leaderboards." />
        <meta name="keywords" content="best golf score tracking app for beginners, how to calculate golf handicap step by step, golf score tracking, golf analytics, golf performance tracking, golf handicap calculator, golf statistics tracker, course leaderboards, digital golf scorecard, golf app" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <link rel="canonical" href="https://mybirdieboard.com/" />
        
        {/* Enhanced structured data with long-tail keywords */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "applicationCategory": "SportsApplication",
            "applicationSubCategory": "GolfScoreTracking",
            "operatingSystem": "Web",
            "name": "MyBirdieBoard - Best Golf Score Tracking App for Beginners",
            "description": "The best golf score tracking app for beginners and experienced golfers. Learn how to calculate golf handicap step by step, track golf scores effectively, and analyze performance with golf analytics.",
            "keywords": "best golf score tracking app for beginners, how to calculate golf handicap step by step, golf score tracking, golf analytics, golf performance tracking, golf handicap calculator, golf statistics tracker, course leaderboards, digital golf scorecard",
            "offers": {
              "@type": "Offer",
              "price": "2.99",
              "priceCurrency": "GBP",
              "priceValidUntil": "2025-12-31",
              "availability": "https://schema.org/OnlineOnly"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "5.0",
              "ratingCount": "125",
              "bestRating": "5",
              "worstRating": "1"
            },
            "contentRating": "General",
            "audience": {
              "@type": "Audience",
              "audienceType": "Golfers of all skill levels",
              "geographicArea": {
                "@type": "Country",
                "name": ["United States", "United Kingdom", "Australia", "Canada"]
              }
            },
            "featureList": [
              "Best Golf Score Tracking App for Beginners",
              "How to Calculate Golf Handicap Step by Step", 
              "Golf Performance Analytics",
              "Golf Statistics Tracker",
              "Course Leaderboards",
              "Digital Golf Scorecard"
            ],
            "potentialAction": {
              "@type": "UseAction",
              "actionStatus": "PotentialActionStatus",
              "object": {
                "@type": "EntryPoint",
                "urlTemplate": "https://mybirdieboard.com/",
                "actionPlatform": ["https://schema.org/DesktopWebPlatform", "https://schema.org/MobileWebPlatform"]
              }
            }
          })}
        </script>

        {/* Additional Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "MyBirdieBoard",
            "url": "https://mybirdieboard.com",
            "description": "The best golf score tracking app for beginners, helping golfers learn how to calculate golf handicap step by step and improve their game through performance analytics.",
            "sameAs": [
              "https://twitter.com/mybirdieboard",
              "https://facebook.com/mybirdieboard"
            ]
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
                <Link to="/" className="flex items-center" aria-label="MyBirdieBoard Home - Best Golf Score Tracking App">
                  <img 
                    src="/lovable-uploads/e65e4018-8608-4c06-aefc-191f9e9de8e0.png" 
                    alt="MyBirdieBoard - Best Golf Score Tracking App for Beginners & Pros" 
                    className="h-32 w-auto object-contain" 
                  />
                </Link>
                <Button 
                  onClick={() => setShowLoginDialog(true)}
                  variant="ghost" 
                  className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all text-xs sm:text-sm py-1"
                  aria-label="Log in to your golf tracking account"
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
        
        {/* Enhanced Golf Resources section with internal links */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Learn More About Golf Score Tracking</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3">How to Calculate Golf Handicap Step by Step</h3>
                <p className="text-muted-foreground mb-4">
                  Learn the official WHS method for calculating your golf handicap with our comprehensive guide.
                </p>
                <Link 
                  to="/guides/golf-handicap-calculator" 
                  className="text-primary hover:underline font-medium"
                >
                  Read Guide →
                </Link>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3">Best Golf Score Tracking Methods</h3>
                <p className="text-muted-foreground mb-4">
                  Discover why digital golf score tracking beats traditional paper methods for improving your game.
                </p>
                <Link 
                  to="/guides/how-to-track-golf-scores" 
                  className="text-primary hover:underline font-medium"
                >
                  Learn More →
                </Link>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3">Golf Performance Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  Use data-driven insights to identify strengths, weaknesses, and areas for improvement in your golf game.
                </p>
                <Link 
                  to="/guides/golf-performance-analytics" 
                  className="text-primary hover:underline font-medium"
                >
                  Explore Analytics →
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        <GolfResourcesSection />
        
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
