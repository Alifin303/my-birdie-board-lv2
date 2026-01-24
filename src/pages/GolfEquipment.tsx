
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LoginDialog } from "@/components/LoginDialog";
import { User, ArrowLeft, Star, TrendingUp, Award } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const equipmentCategories = [
  {
    title: "Golf GPS Watches",
    description: "Track distances, hazards, and improve course management",
    features: ["Precise yardages", "Course maps", "Shot tracking", "Fitness monitoring"],
    icon: <TrendingUp className="h-8 w-8 text-primary" />
  },
  {
    title: "Golf Clubs",
    description: "Complete sets and individual clubs for every skill level",
    features: ["Driver optimization", "Iron consistency", "Wedge precision", "Putter accuracy"],
    icon: <Award className="h-8 w-8 text-primary" />
  },
  {
    title: "Golf Balls",
    description: "Performance golf balls designed for distance and control",
    features: ["Distance technology", "Spin control", "Durability", "Weather resistance"],
    icon: <Star className="h-8 w-8 text-primary" />
  }
];

export default function GolfEquipment() {
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  return (
    <>
      <Helmet>
        <title>Best Golf Equipment 2025 - GPS Watches, Clubs & Performance Gear | MyBirdieBoard</title>
        <meta name="description" content="Discover the best golf equipment for 2025. GPS watches, golf clubs, balls, and performance tracking gear to improve your golf game. Expert reviews and recommendations." />
        <meta name="keywords" content="golf equipment, best golf equipment 2025, golf GPS watches, golf clubs, golf balls, golf gear, golf accessories, golf performance equipment" />
        <link rel="canonical" href="https://mybirdieboard.com/golf-equipment" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Best Golf Equipment 2025",
            "description": "Discover the best golf equipment for 2025. GPS watches, golf clubs, balls, and performance tracking gear.",
            "url": "https://mybirdieboard.com/golf-equipment",
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": equipmentCategories.map((category, index) => ({
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
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Best Golf Equipment 2025</h1>
              <p className="text-lg text-white/90">GPS watches, golf clubs, balls, and performance gear to elevate your game</p>
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
              <h2 className="text-2xl font-bold mb-6">Essential Golf Equipment Categories</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {equipmentCategories.map((category) => (
                  <Card key={category.title} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-3 mb-2">
                        {category.icon}
                        <CardTitle className="text-xl">{category.title}</CardTitle>
                      </div>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.features.map((feature) => (
                          <li key={feature} className="flex items-center text-sm">
                            <Star className="h-4 w-4 text-accent mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">How to Choose Golf Equipment</h2>
              <div className="prose prose-lg max-w-none">
                <p>Selecting the right golf equipment is crucial for improving your game and tracking performance effectively. Here's what to consider:</p>
                
                <h3>Golf GPS Watches & Performance Tracking</h3>
                <p>Modern golf GPS watches integrate seamlessly with score tracking apps like MyBirdieBoard, providing accurate yardages, shot tracking, and performance analytics to help you make data-driven improvements to your game.</p>
                
                <h3>Golf Club Selection</h3>
                <p>Your golf clubs should match your skill level and swing characteristics. Consider factors like shaft flex, club head design, and forgiveness when building your set.</p>
                
                <h3>Golf Ball Technology</h3>
                <p>Different golf balls are designed for different aspects of the game - distance, spin control, or feel around the greens. Match your ball choice to your priorities and skill level.</p>
              </div>
            </section>

            <div className="bg-accent/10 rounded-lg p-8">
              <h3 className="text-2xl font-semibold mb-4">Track Your Equipment Performance</h3>
              <p className="text-muted-foreground mb-6">Use MyBirdieBoard to track how different equipment affects your scores and performance across different courses.</p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Related Golf Resources:</h4>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <Link to="/guides/golf-performance-analytics" className="text-primary hover:underline">Golf Performance Analytics</Link>
                    <Link to="/guides/golf-statistics-tracker" className="text-primary hover:underline">Golf Statistics Tracker</Link>
                    <Link to="/guides/how-to-track-golf-scores" className="text-primary hover:underline">Score Tracking Guide</Link>
                    <Link to="/blog" className="text-primary hover:underline">Golf Equipment Reviews</Link>
                  </div>
                </div>
                <Link to="/">
                  <Button size="lg" className="bg-accent hover:bg-accent/90">
                    Start Tracking Your Equipment Performance
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
