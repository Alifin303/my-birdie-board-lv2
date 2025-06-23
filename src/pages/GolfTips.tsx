
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LoginDialog } from "@/components/LoginDialog";
import { User, ArrowLeft, Target, TrendingUp, BarChart3, Lightbulb } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const tipCategories = [
  {
    title: "Swing Fundamentals",
    description: "Master the basics of a consistent golf swing",
    tips: ["Proper grip technique", "Stance and posture", "Backswing mechanics", "Follow-through"],
    icon: <Target className="h-8 w-8 text-primary" />
  },
  {
    title: "Short Game",
    description: "Improve your putting, chipping, and wedge play",
    tips: ["Putting alignment", "Chip shot selection", "Bunker play", "Distance control"],
    icon: <TrendingUp className="h-8 w-8 text-primary" />
  },
  {
    title: "Course Management",
    description: "Strategic approaches to lower your scores",
    tips: ["Club selection", "Risk assessment", "Course mapping", "Mental game"],
    icon: <BarChart3 className="h-8 w-8 text-primary" />
  },
  {
    title: "Practice Tips",
    description: "Effective practice routines and drills",
    tips: ["Range sessions", "Practice games", "Skill development", "Goal setting"],
    icon: <Lightbulb className="h-8 w-8 text-primary" />
  }
];

export default function GolfTips() {
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  return (
    <>
      <Helmet>
        <title>Golf Tips & Improvement Strategies - Lower Your Scores | MyBirdieBoard</title>
        <meta name="description" content="Expert golf tips to improve your game. Swing fundamentals, short game techniques, course management strategies, and practice routines to lower your golf scores." />
        <meta name="keywords" content="golf tips, golf improvement, golf swing tips, golf lessons, how to play golf better, golf techniques, golf practice, golf instruction" />
        <link rel="canonical" href="https://mybirdieboard.com/golf-tips" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Golf Tips & Improvement Strategies",
            "description": "Expert golf tips to improve your game and lower your scores.",
            "url": "https://mybirdieboard.com/golf-tips",
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": tipCategories.map((category, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": category.title,
                "description": category.description
              }))
            }
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-white py-12">
          <div className="container mx-auto px-4">
            <BreadcrumbNav />
            <div className="mt-4">
              <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Golf Tips & Improvement Strategies</h1>
              <p className="text-lg text-white/90">Expert advice to lower your scores and improve your golf game</p>
            </div>
          </div>
        </header>

        <div className="absolute top-4 right-4 z-10">
          <Button 
            variant="ghost" 
            className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all" 
            onClick={() => setShowLoginDialog(true)}
          >
            <User className="mr-2 h-4 w-4" />
            Log In
          </Button>
        </div>
        
        <main className="container mx-auto py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Essential Golf Improvement Areas</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {tipCategories.map((category) => (
                  <Card key={category.title} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex flex-col items-center text-center">
                        {category.icon}
                        <CardTitle className="text-lg mt-2">{category.title}</CardTitle>
                      </div>
                      <CardDescription className="text-center">{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.tips.map((tip) => (
                          <li key={tip} className="flex items-start text-sm">
                            <div className="w-2 h-2 bg-accent rounded-full mt-2 mr-2 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Data-Driven Golf Improvement</h2>
              <div className="prose prose-lg max-w-none">
                <p>The best golf tips are backed by data and performance tracking. Here's how to use analytics to identify your improvement opportunities:</p>
                
                <h3>Track Your Performance Patterns</h3>
                <p>Use golf score tracking to identify which aspects of your game need the most attention. Are you losing strokes on the tee, approach shots, or putting? Data reveals the truth.</p>
                
                <h3>Set Measurable Goals</h3>
                <p>Instead of just "play better golf," set specific targets like "improve putting average from 2.1 to 1.9 putts per hole" or "hit 60% of fairways." Track progress with apps like MyBirdieBoard.</p>
                
                <h3>Practice With Purpose</h3>
                <p>Focus practice time on your biggest scoring opportunities. If data shows you're losing 3 strokes per round to poor wedge play, prioritize short game practice over driving range sessions.</p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Quick Golf Tips for Immediate Improvement</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Scoring Tips</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">•</span>
                      <span>Play within your abilities - club selection is key to consistent scoring</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">•</span>
                      <span>Focus on lag putting - get your first putt close to reduce three-putts</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">•</span>
                      <span>Practice your 100-yard shots - most scoring opportunities happen here</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Mental Game</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">•</span>
                      <span>Develop a pre-shot routine for consistency under pressure</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">•</span>
                      <span>Stay in the present - focus on the current shot, not past mistakes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">•</span>
                      <span>Track positive stats to build confidence in your abilities</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <div className="bg-accent/10 rounded-lg p-8">
              <h3 className="text-2xl font-semibold mb-4">Put These Tips Into Practice</h3>
              <p className="text-muted-foreground mb-6">Track your improvement with detailed golf analytics and see which tips have the biggest impact on your scores.</p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Related Resources:</h4>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <Link to="/guides/golf-performance-analytics" className="text-primary hover:underline">Performance Analytics</Link>
                    <Link to="/guides/how-to-track-golf-scores" className="text-primary hover:underline">Score Tracking</Link>
                    <Link to="/blog/golf-score-tracking-tips" className="text-primary hover:underline">Tracking Tips</Link>
                    <Link to="/blog" className="text-primary hover:underline">More Golf Tips</Link>
                  </div>
                </div>
                <Link to="/">
                  <Button size="lg" className="bg-accent hover:bg-accent/90">
                    Start Tracking Your Improvement
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
        
        <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
      </div>
    </>
  );
}
