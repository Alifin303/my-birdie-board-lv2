import { useState, useEffect } from "react";
import { MainContent } from "@/components/MainContent";
import { LoginDialog } from "@/components/LoginDialog";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
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
    if (typeof window !== "undefined" && window.fbq) {
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
  return <>
      <SEOHead
        title="Golf Score Tracker & Handicap Calculator | MyBirdieBoard"
        description="Track golf scores, calculate handicap, analyze performance. Free to start with 4 rounds. Join golfers improving their game with MyBirdieBoard."
        keywords="golf score tracking, golf handicap calculator, golf performance analytics, course leaderboards, digital golf scorecard"
      >
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <link rel="preload" as="image" href={currentBackgroundImage} fetchPriority="high" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        <script type="application/ld+json">
          {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "applicationCategory": "SportsApplication",
          "operatingSystem": "Web",
          "name": "MyBirdieBoard - Best Golf Score Tracking App for Beginners",
          "description": "The best golf score tracking app for beginners and experienced golfers.",
          "offers": { "@type": "Offer", "price": "2.99", "priceCurrency": "GBP", "availability": "https://schema.org/OnlineOnly" },
          "contentRating": "General",
          "featureList": ["Golf Score Tracking", "Handicap Calculator", "Performance Analytics", "Course Leaderboards"]
        })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "MyBirdieBoard",
          "url": "https://mybirdieboard.com",
          "sameAs": ["https://twitter.com/mybirdieboard", "https://facebook.com/mybirdieboard"]
        })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [{
            "@type": "Question",
            "name": "How do I track my golf scores with MyBirdieBoard?",
            "acceptedAnswer": { "@type": "Answer", "text": "After you finish your round, simply log in to MyBirdieBoard and add your scores in seconds." }
          }, {
            "@type": "Question",
            "name": "How does MyBirdieBoard calculate my golf handicap?",
            "acceptedAnswer": { "@type": "Answer", "text": "MyBirdieBoard automatically calculates your handicap index using the World Handicap System (WHS) formula." }
          }, {
            "@type": "Question",
            "name": "Is MyBirdieBoard free to use?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes, you can start tracking your golf rounds with MyBirdieBoard for free. Premium features are available for £2.99." }
          }]
        })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mybirdieboard.com/" }]
        })}
        </script>
      </SEOHead>
      
      <div className="min-h-screen flex flex-col">
        <div className="relative flex-1 overflow-hidden" style={{
        backgroundImage: `url('${currentBackgroundImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#2C4A3B",
        // Fallback color
        backgroundAttachment: isMobile ? "scroll" : "fixed" // Better performance on mobile
      }}>
          {/* Dark overlay with improved opacity for better text contrast */}
          <div className="absolute inset-0 bg-black z-0" style={{
          opacity: 0.25
        }} aria-hidden="true"></div>
          
          <header className="absolute top-0 left-0 right-0 z-10">
            <div className="container mx-auto px-4 py-2">
              <nav className="flex items-center justify-between mx-0 my-0">
                <Link to="/" className="flex items-center" aria-label="MyBirdieBoard Home - Best Golf Score Tracking App">
                  <img 
                    src="/lovable-uploads/e65e4018-8608-4c06-aefc-191f9e9de8e0.png" 
                    alt="MyBirdieBoard logo - Best golf score tracking app for calculating handicap and tracking golf performance" 
                    className="h-20 sm:h-24 md:h-32 w-auto object-contain"
                    width="128"
                    height="128"
                    fetchPriority="high"
                  />
                </Link>
                <Button onClick={() => setShowLoginDialog(true)} variant="ghost" className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all text-xs sm:text-sm py-1" aria-label="Log in to your account">
                  <User className="mr-1 h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                  Log In
                </Button>
              </nav>
            </div>
          </header>
          
          <main className="relative z-[1] pt-24 sm:pt-28 md:pt-36 w-full text-center sm:text-left">
            <h1 className="sr-only">MyBirdieBoard - Golf Score Tracking & Handicap Calculator App</h1>
            <MainContent onStartSignup={handleStartSignup} />
            
            {/* Add the UserReviews component */}
            <UserReviews />
          </main>
        </div>
        
        {/* Enhanced Golf Resources section with internal links */}
        <section aria-labelledby="resources-heading" aria-label="Golf score tracking resources and guides" className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 id="resources-heading" className="text-3xl font-bold text-center mb-8">Learn More About Golf Score Tracking</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3">How to Calculate Golf Handicap Step by Step</h3>
                <p className="text-muted-foreground mb-4">
                  Learn the official WHS method for calculating your golf handicap with our comprehensive guide.
                </p>
                <Link to="/guides/golf-handicap-calculator" className="text-primary hover:underline font-medium">
                  Read Guide →
                </Link>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3">Best Golf Score Tracking Methods</h3>
                <p className="text-muted-foreground mb-4">
                  Discover why digital golf score tracking beats traditional paper methods for improving your game.
                </p>
                <Link to="/guides/how-to-track-golf-scores" className="text-primary hover:underline font-medium">
                  Learn More →
                </Link>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3">Golf Performance Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  Use data-driven insights to identify strengths, weaknesses, and areas for improvement in your golf game.
                </p>
                <Link to="/guides/golf-performance-analytics" className="text-primary hover:underline font-medium">
                  Explore Analytics →
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        <GolfResourcesSection />
        
        <SocialFooter />
        <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
        <SignUpDialog open={showSignupDialog} onOpenChange={setShowSignupDialog} />
      </div>
    </>;
};
export default Index;