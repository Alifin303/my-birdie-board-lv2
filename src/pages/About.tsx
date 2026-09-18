import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SignUpDialog } from "@/components/SignUpDialog";
import { LoginDialog } from "@/components/LoginDialog";
import { UserPlus } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
const About = () => {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const handleGetStarted = () => {
    setShowSignupDialog(true);
  };
  return (
    <>
      <SEOHead
        title="About Us - Golf Score Tracking App | MyBirdieBoard"
        description="MyBirdieBoard is a distraction-free golf score tracker. Log rounds after you play, track handicap, and compete on course leaderboards."
        keywords="golf score tracking, golf analytics, golf performance tracking, golf handicap, golf statistics tracker"
      >
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mybirdieboard.com/" },
              { "@type": "ListItem", "position": 2, "name": "About", "item": "https://mybirdieboard.com/about" }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About MyBirdieBoard",
            "description": "MyBirdieBoard is the leading golf score tracking and analytics platform.",
            "mainEntity": { "@type": "Organization", "name": "MyBirdieBoard" }
          })}
        </script>
      </SEOHead>
      <div className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat relative" style={{
      backgroundImage: `url('https://www.suttongreengc.co.uk/wp-content/uploads/2023/02/membership-featured.jpg')`,
      backgroundColor: "#2C4A3B" // Fallback color if image fails to load
    }}>
        {/* Dark overlay div */}
        <div className="absolute inset-0 bg-black opacity-20 z-0"></div>
        
        <div className="absolute top-4 right-4 z-10">
          <Button variant="ghost" className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all" onClick={() => setShowLoginDialog(true)} aria-label="Log in to your account">
            Log In
          </Button>
          <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
        </div>
        <main className="container max-w-4xl mx-auto px-4 py-8 sm:py-16 relative z-[1]">
          <Link to="/" className="text-white/80 hover:text-white mb-4 sm:mb-8 inline-block" aria-label="Return to homepage">
            ← Back to home
          </Link>
          <article className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-8 text-white">
            <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6">About MyBirdieBoard</h1>
            
            <div className="space-y-4 sm:space-y-6 text-white/90 text-sm sm:text-base">
              <p className="text-lg sm:text-xl font-medium">Your digital golf journal — built for golfers who want to track, reflect, and improve.</p>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3">My Story</h2>
                <p>I used to track my rounds with a mobile app paired to my smartwatch. It worked, but looking back at my progress was a mess — just one long list of every round, with no easy way to see how I'd actually played at a specific course. My phone battery took a hit every round too.</p>
                <p className="mt-3">So I started keeping my own spreadsheet, organised by course, so I could see how far I'd come — especially useful after a bad round, when a bit of perspective helps more than anything.</p>
                <p className="mt-3">That spreadsheet became the idea for MyBirdieBoard. I wanted something cloud-based I could check from anywhere, showing my progress both overall and course-by-course. <Link to="/blog/nomadic-golfer-scoring-guide" className="underline hover:text-white/80" aria-label="Read the nomadic golfer's guide to tracking scores without a home club">I've never belonged to a club</Link>, so I'd never had a proper handicap either — I wanted <Link to="/tools/handicap-calculator" className="underline hover:text-white/80" aria-label="Open the free golf handicap calculator">a guideline I could actually trust</Link>. And more than anything, I wanted a kind of memory book: every course I've played, where it is, and how I got on there.</p>
                <p className="mt-3">These days I play with just a rangefinder and a paper scorecard — no phone in hand for the whole round. It's a side effect I didn't expect: a proper cut-off from the outside world, and a chance to clear my head for a few hours. MyBirdieBoard is what I built to keep that feeling, without losing the record afterwards.</p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3">What You Can Do With MyBirdieBoard</h2>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-start">
                    <span className="mr-2" aria-hidden="true">🏌️</span>
                    <span><strong>Log every round you play</strong> — no more lost scorecards or forgotten milestones. Your entire golf history in one place.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2" aria-hidden="true">📊</span>
                    <span><strong>Track your performance over time</strong> — spot patterns in your scoring, set goals, and measure real improvement.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2" aria-hidden="true">🏆</span>
                    <span><strong>Compete on course leaderboards</strong> — see where you rank at your home course with Gross and Net scores.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2" aria-hidden="true">⛳</span>
                    <span><strong>Monitor your handicap</strong> — your index updates automatically as you add rounds, giving you a true picture of your progress.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2" aria-hidden="true">🗺️</span>
                    <span><strong>Build your golf course map</strong> — every round drops a pin on your own personal map, creating a visual record of every course you've played.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2" aria-hidden="true">📱</span>
                    <span><strong>Quick score entry</strong> — add your round in seconds after you play. Simple, fast, distraction-free.</span>
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3">Who Is MyBirdieBoard For?</h2>
                <p>MyBirdieBoard is for golfers who care about their game — whether you're a weekend player working to break 100, or a single-digit handicapper chasing your best season yet.</p>
                <p className="mt-3">If you want to play focused, track your scores after the round, and build a permanent record of your golf journey, MyBirdieBoard is for you.</p>
              </section>

              <section>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3">Your Golf Legacy Starts Here</h2>
                <p>Every round you play is part of your story — don't let it get lost. Join MyBirdieBoard today and start building yours.</p>
              </section>
            </div>

            <div className="mt-6 sm:mt-8 text-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 h-12 shadow-lg transition-all duration-300" onClick={handleGetStarted} aria-label="Sign up for MyBirdieBoard">
                <UserPlus className="mr-2 h-5 w-5" aria-hidden="true" />
                Sign up
              </Button>
            </div>
          </article>
        </main>
        <SignUpDialog open={showSignupDialog} onOpenChange={setShowSignupDialog} />
      </div>
    </>
  );
};
export default About;
