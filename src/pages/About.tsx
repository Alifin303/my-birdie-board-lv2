
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SignUpDialog } from "@/components/SignUpDialog";
import { LoginDialog } from "@/components/LoginDialog";

const About = () => {
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat relative"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80')`,
      }}
    >
      <div className="absolute top-4 right-4">
        <Button 
          variant="ghost" 
          className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all"
          onClick={() => setShowLoginDialog(true)}
        >
          Log In
        </Button>
        <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
      </div>
      <div className="container max-w-4xl mx-auto px-4 py-16">
        <Link to="/" className="text-white/80 hover:text-white mb-8 inline-block">
          ← Back to home
        </Link>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
          <h1 className="text-4xl font-bold mb-6">BirdieBoard</h1>
          
          <div className="space-y-6 text-white/90">
            <p>
              At BirdieBoard, we believe every golfer deserves a smarter way to track their game. Keeping score on paper is a thing of the past—our digital platform allows you to store, analyze, and compete like never before.
            </p>

            <p>
              We built BirdieBoard with three goals in mind:
            </p>

            <div className="pl-4 border-l-4 border-primary/60 my-6">
              <h3 className="text-xl font-bold mb-2">🏆 Track Your Performance</h3>
              <p>Upload scorecards from any course and get detailed insights into your game. Our intuitive graphs help you visualize progress, from tee shots to putting stats.</p>
            </div>

            <div className="pl-4 border-l-4 border-primary/60 my-6">
              <h3 className="text-xl font-bold mb-2">⛳ Improve Your Handicap</h3>
              <p>Our built-in handicap calculator provides an accurate reflection of your skill level based on your latest rounds—helping you compete fairly with others.</p>
            </div>

            <div className="pl-4 border-l-4 border-primary/60 my-6">
              <h3 className="text-xl font-bold mb-2">📊 Compete with Friends & Leaderboards</h3>
              <p>BirdieBoard connects golfers worldwide through course-based leaderboards. Compare your scores with other players at your favorite courses and challenge yourself to climb the ranks.</p>
            </div>

            <p>
              Whether you're aiming for lower scores, a better handicap, or just bragging rights at the clubhouse, BirdieBoard is here to help you elevate your game.
            </p>

            <p className="font-bold text-center text-xl my-8">
              📌 Join the BirdieBoard community today and start tracking your way to better golf!
            </p>
          </div>

          <div className="mt-8 text-center">
            <SignUpDialog />
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
