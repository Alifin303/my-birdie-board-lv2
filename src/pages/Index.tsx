import { useState, useEffect } from "react";
import { MainContent } from "@/components/MainContent";
import { LoginDialog } from "@/components/LoginDialog";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { SocialFooter } from "@/components/SocialFooter";
import { SignUpDialog } from "@/components/SignUpDialog";
import { UserReviews } from "@/components/UserReviews";
import { GolfResourcesSection } from "@/components/GolfResourcesSection";
import { HomepageSEOSections } from "@/components/HomepageSEOSections";
import { useIsMobile } from "@/hooks/use-mobile";
const Index = () => {
  const location = useLocation();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const isMobile = useIsMobile();

  // When SSG fallback serves the homepage HTML for a different route (e.g. /admin),
  // force a full reload so the client-side router picks up the correct route.
  useEffect(() => {
    if (typeof window !== 'undefined' && location.pathname !== '/') {
      window.location.reload();
    }
  }, []);
  useEffect(() => {
    // Track page view in Meta Pixel when component mounts
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, []);

  useEffect(() => {
    const handleOpenLogin = () => setShowLoginDialog(true);
    window.addEventListener('open-login-dialog', handleOpenLogin);
    return () => window.removeEventListener('open-login-dialog', handleOpenLogin);
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
        title="Golf Score Tracker & Handicap App | MyBirdieBoard"
        description="Track golf scores after your round, calculate your handicap, and analyze performance over time with MyBirdieBoard's distraction-free golf tracker."
        keywords="golf score tracking, golf handicap calculator, golf score tracker, golf performance analytics, course leaderboards, digital golf scorecard, golf logbook"
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
          "name": "MyBirdieBoard - Golf Score Tracker & Handicap App",
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
            "name": "Can I track golf scores without using my phone during a round?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes — MyBirdieBoard is designed specifically for post-round score entry. Play your round distraction-free, then log your scores in seconds when you're done. No need to carry your phone on the course." }
          }, {
            "@type": "Question",
            "name": "How do I calculate my golf handicap?",
            "acceptedAnswer": { "@type": "Answer", "text": "MyBirdieBoard calculates your handicap automatically using the World Handicap System (WHS) formula. Just add your rounds and your handicap index updates after each one." }
          }, {
            "@type": "Question",
            "name": "What is the best way to track golf performance over time?",
            "acceptedAnswer": { "@type": "Answer", "text": "The best approach is consistent post-round tracking. MyBirdieBoard stores every round, visualizes scoring trends, and highlights where you're gaining or losing strokes — giving you a clear picture of your progress." }
          }, {
            "@type": "Question",
            "name": "Is MyBirdieBoard a golf score tracking app?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes — MyBirdieBoard is a golf score tracker, handicap calculator, and performance analytics tool built for golfers who prefer to focus on the game during their round and record everything afterward." }
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
            <h1 className="sr-only">Golf Score Tracker & Handicap Calculator Without On-Course Distractions</h1>
            <MainContent onStartSignup={handleStartSignup} />
            
            {/* Add the UserReviews component */}
            <UserReviews />
          </main>
        </div>
        
        <HomepageSEOSections />
        
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