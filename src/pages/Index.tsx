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
  return <>
      <Helmet>
        {/* Title <60 chars, Description <160 chars */}
        <title>Golf Score Tracker & Handicap Calculator | MyBirdieBoard</title>
        <meta name="description" content="Track golf scores, calculate handicap, analyze performance. Free to start with 4 rounds. Join golfers improving their game with MyBirdieBoard." />
        <meta name="keywords" content="golf score tracking, golf handicap calculator, golf performance analytics, course leaderboards, digital golf scorecard" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <link rel="canonical" href="https://mybirdieboard.com/" />
        
        {/* Preload critical hero image for LCP performance */}
        <link rel="preload" as="image" href={currentBackgroundImage} fetchPriority="high" />
        
        {/* Open Graph meta tags */}
        <meta property="og:title" content="Golf Score Tracker & Handicap Calculator" />
        <meta property="og:description" content="Track scores, calculate handicap, compete on leaderboards. Start free with MyBirdieBoard." />
        <meta property="og:url" content="https://mybirdieboard.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://mybirdieboard.com/og-image.png" />
        <meta property="og:image:alt" content="MyBirdieBoard golf score tracking dashboard" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Golf Score Tracker & Handicap Calculator" />
        <meta name="twitter:description" content="Track scores, calculate handicap, compete on leaderboards. Start free." />
        <meta name="twitter:image" content="https://mybirdieboard.com/og-image.png" />
        
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
          "featureList": ["Best Golf Score Tracking App for Beginners", "How to Calculate Golf Handicap Step by Step", "Golf Performance Analytics", "Golf Statistics Tracker", "Course Leaderboards", "Digital Golf Scorecard"],
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
          "sameAs": ["https://twitter.com/mybirdieboard", "https://facebook.com/mybirdieboard"]
        })}
        </script>

        {/* Review/Rating Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "MyBirdieBoard - Golf Score Tracking App",
          "description": "Digital golf journal for tracking scores, calculating handicaps, and improving your golf game through analytics.",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "5.0",
            "ratingCount": "125",
            "bestRating": "5",
            "worstRating": "1"
          },
          "review": [{
            "@type": "Review",
            "author": {
              "@type": "Person",
              "name": "David Smith"
            },
            "datePublished": "2024-11-15",
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": "5",
              "bestRating": "5"
            },
            "reviewBody": "Simple, elegant, and exactly what I needed. MyBirdieBoard keeps all my rounds organized without unnecessary complications."
          }, {
            "@type": "Review",
            "author": {
              "@type": "Person",
              "name": "Sarah Johnson"
            },
            "datePublished": "2024-12-01",
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": "5",
              "bestRating": "5"
            },
            "reviewBody": "Finally, a golf app that focuses on what matters - tracking my scores and seeing real improvement over time."
          }]
        })}
        </script>

        {/* FAQ Schema for Featured Snippets */}
        <script type="application/ld+json">
          {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [{
            "@type": "Question",
            "name": "How do I track my golf scores with MyBirdieBoard?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "After you finish your round, simply log in to MyBirdieBoard and add your scores in seconds. No need to use your phone on the course - play with focus and track afterwards. Your rounds are saved permanently in your digital golf archive."
            }
          }, {
            "@type": "Question",
            "name": "How does MyBirdieBoard calculate my golf handicap?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "MyBirdieBoard automatically calculates your handicap index using the World Handicap System (WHS) formula. As you add rounds, your handicap updates automatically based on your best 8 scores from your last 20 rounds, adjusted for course difficulty and slope rating."
            }
          }, {
            "@type": "Question",
            "name": "Can I see my golf performance analytics?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! MyBirdieBoard provides clear charts showing your score progression, trends over time, and exactly where you're gaining or losing strokes. You'll see which areas of your game need practice and track your improvement journey."
            }
          }, {
            "@type": "Question",
            "name": "What are course leaderboards?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Course leaderboards let you compare your performance with other golfers at your home course. See where you rank and compete for the top spot based on your best rounds at each course you play."
            }
          }, {
            "@type": "Question",
            "name": "Is MyBirdieBoard free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, you can start tracking your golf rounds with MyBirdieBoard for free. Premium features are available for £2.99 to unlock advanced analytics and unlimited round storage."
            }
          }]
        })}
        </script>

        {/* Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://mybirdieboard.com/"
          }]
        })}
        </script>
      </Helmet>
      
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
                  <img src="/lovable-uploads/e65e4018-8608-4c06-aefc-191f9e9de8e0.png" alt="MyBirdieBoard logo - Best golf score tracking app for calculating handicap and tracking golf performance" className="h-20 sm:h-24 md:h-32 w-auto object-contain" />
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