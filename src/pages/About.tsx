import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SignUpDialog } from "@/components/SignUpDialog";
import { LoginDialog } from "@/components/LoginDialog";
import { UserPlus } from "lucide-react";
import { Helmet } from "react-helmet-async";
const About = () => {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const handleGetStarted = () => {
    setShowSignupDialog(true);
  };
  return <>
      <Helmet>
        <title>About MyBirdieBoard - Your Digital Golf Journal & Score Tracking Solution</title>
        <meta name="description" content="Learn how MyBirdieBoard, your digital golf journal, helps golfers track scores, analyze performance, and compete on leaderboards to improve their game." />
        <link rel="canonical" href="https://mybirdieboard.com/about" />
        <meta property="og:image" content="/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mybirdieboard.com/about" />
        <meta property="og:title" content="About MyBirdieBoard - Your Digital Golf Journal & Score Tracking Solution" />
        <meta property="og:description" content="Learn how MyBirdieBoard, your digital golf journal, helps golfers track scores, analyze performance, and compete on leaderboards to improve their game." />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:image" content="/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png" />
        <meta name="keywords" content="digital golf journal, golf score tracking, golf performance analytics, golf leaderboards, golf handicap calculator" />
        <meta name="ai:description" content="MyBirdieBoard is a digital golf journal that helps golfers track rounds, analyze performance, and understand their game better." />
      </Helmet>
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
            <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6">MyBirdieBoard</h1>
            
            <div className="space-y-4 sm:space-y-6 text-white/90 text-sm sm:text-base">
              <p>Your digital golf journal — built for golfers who want to track, reflect, and improve.</p>

              <p>Every round of golf tells a story — the clutch birdie, the double on 18, the near-miss personal best. But how do you remember it all?
That’s where MyBirdieBoard comes in.
            </p>

              <div className="my-6 sm:my-8">
                <p className="font-semibold mb-2 sm:mb-4">With MyBirdieBoard, you can:</p>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-start">
                    <span className="mr-2" aria-hidden="true">🏌️</span>
                    <span> Log every round you play — no more lost scorecards or forgotten milestones.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2" aria-hidden="true">📊</span>
                    <span>Track your performance over time — spot patterns, set goals, and keep improving.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2" aria-hidden="true">🏆</span>
                    <span>Compete on course leaderboards — see where you stand with Gross and Net scores.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2" aria-hidden="true">⛳</span>
                    <span>Monitor your handicap — watch your trends and measure real progress.</span>
                  </li>
                </ul>
              </div>

              <p>Whether you’re a weekend golfer or a scratch player, MyBirdieBoard gives you a place to store your stats, tell your story, and stay motivated — all after you’ve walked off the 18th green.</p>

              <p className="font-semibold mt-4 sm:mt-6">
                Ready to take control of your golf game?<br />
                Join MyBirdieBoard today. Your best round is yet to come.
              </p>
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
    </>;
};
export default About;
