
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SignUpDialog } from "@/components/SignUpDialog";
import { LoginDialog } from "@/components/LoginDialog";

const About = () => {
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat relative"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80')`,
      }}
    >
      <div className="absolute top-4 right-4">
        <LoginDialog />
      </div>
      <div className="container max-w-4xl mx-auto px-4 py-16">
        <Link to="/" className="text-white/80 hover:text-white mb-8 inline-block">
          ← Back to home
        </Link>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
          <h1 className="text-4xl font-bold mb-6">About BirdieBoard</h1>
          
          <div className="space-y-6 text-white/90">
            <p>
              Welcome to BirdieBoard, your personal golf score tracker designed to help you improve your game and stay motivated. Whether you're a casual player or a passionate golfer, BirdieBoard gives you the tools to track your rounds, monitor your progress, and compete with others.
            </p>

            <p>
              With BirdieBoard, you can easily enter your scores — hole by hole — for any golf course you've played. We'll store your historic scores and highlight your best performances. Plus, you'll see what your best possible score could have been if you played your best on every hole, giving you a clear picture of your potential.
            </p>

            <p>
              Our leaderboards take the competition to the next level, letting you compare your scores not only against others at the same course but also within your handicap range. Whether it's daily, weekly, monthly, or all-time leaderboards, you'll see exactly how you stack up against golfers of a similar skill level — making every round feel like part of a bigger game.
            </p>

            <p>
              We also calculate your handicap based on the scores you enter, helping you track your improvement over time and better understand your playing ability.
            </p>

            <p>
              Track your rounds, climb the leaderboards, and push your game forward with BirdieBoard — where every swing counts.
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
