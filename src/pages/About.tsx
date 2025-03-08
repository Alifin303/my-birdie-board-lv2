
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { SignUpDialog } from "@/components/SignUpDialog";
import { LoginDialog } from "@/components/LoginDialog";

const About = () => {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/quiz');
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat relative"
      style={{
        backgroundImage: `url('https://www.suttongreengc.co.uk/wp-content/uploads/2023/02/membership-featured.jpg')`,
        backgroundColor: "#2C4A3B", // Fallback color if image fails to load
      }}
    >
      {/* Dark overlay div */}
      <div className="absolute inset-0 bg-black opacity-20 z-0"></div>
      
      <div className="absolute top-4 right-4 z-10">
        <Button 
          variant="ghost" 
          className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all"
          onClick={() => setShowLoginDialog(true)}
          aria-label="Log in to your account"
        >
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
            <p>
              At MyBirdieBoard, we believe every golfer deserves a smarter way to track their game. Keeping score on paper is a thing of the past—our digital platform allows you to store, analyze, and compete like never before.
            </p>

            <p>
              We built MyBirdieBoard with three goals in mind:
            </p>

            <section className="pl-3 sm:pl-4 border-l-4 border-primary/60 my-4 sm:my-6">
              <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">🏆 Track Your Performance</h2>
              <p>Upload scorecards from any course and get detailed insights into your game. Our intuitive graphs help you visualize progress, from tee shots to putting stats.</p>
            </section>

            <section className="pl-3 sm:pl-4 border-l-4 border-primary/60 my-4 sm:my-6">
              <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">⛳ Improve Your Handicap</h2>
              <p>Our built-in handicap calculator provides an accurate reflection of your skill level based on your latest rounds—helping you compete fairly with others.</p>
            </section>

            <section className="pl-3 sm:pl-4 border-l-4 border-primary/60 my-4 sm:my-6">
              <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">📊 Compete with Friends & Leaderboards</h2>
              <p>MyBirdieBoard connects golfers worldwide through course-based leaderboards. Compare your scores with other players at your favorite courses and challenge yourself to climb the ranks.</p>
            </section>

            <p>
              Whether you're aiming for lower scores, a better handicap, or just bragging rights at the clubhouse, MyBirdieBoard is here to help you elevate your game.
            </p>

            <p className="font-bold text-center text-lg sm:text-xl my-6 sm:my-8">
              📌 Join the MyBirdieBoard community today and start tracking your way to better golf!
            </p>
          </div>

          <div className="mt-6 sm:mt-8 text-center">
            <Button 
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 h-12 shadow-lg transition-all duration-300"
              onClick={handleGetStarted}
              aria-label="Take the golf improvement quiz"
            >
              <span className="mr-2" aria-hidden="true">🏌️‍♂️</span>
              Get Started
            </Button>
          </div>
        </article>
      </main>
    </div>
  );
};

export default About;
