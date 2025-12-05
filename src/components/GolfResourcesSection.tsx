
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Calculator, TrendingUp, Target, Award, Map, Star } from "lucide-react";

export const GolfResourcesSection = () => {
  const resources = [
    {
      title: "How to Track Golf Scores",
      description: "Learn the best methods for tracking your golf scores effectively",
      icon: BarChart3,
      link: "/guides/how-to-track-golf-scores",
      keywords: "golf score tracking, digital scorecard"
    },
    {
      title: "Golf Handicap Calculator",
      description: "Calculate and understand your golf handicap with our complete guide",
      icon: Calculator,
      link: "/guides/golf-handicap-calculator",
      keywords: "golf handicap, handicap calculator"
    },
    {
      title: "Stableford Scoring Explained",
      description: "Learn how Stableford points work and track your Stableford scores",
      icon: Star,
      link: "/blog/stableford-scoring",
      keywords: "stableford scoring, stableford points, golf scoring"
    },
    {
      title: "Best Golf Score Apps",
      description: "Compare the top golf score tracking apps of 2024",
      icon: Target,
      link: "/guides/best-golf-score-tracking-apps",
      keywords: "golf apps, score tracking apps"
    },
    {
      title: "Golf Performance Analytics",
      description: "Use data and analytics to improve your golf game",
      icon: TrendingUp,
      link: "/guides/golf-performance-analytics",
      keywords: "golf analytics, performance tracking"
    },
    {
      title: "Golf Statistics Tracker",
      description: "Essential golf statistics every golfer should monitor",
      icon: Award,
      link: "/guides/golf-statistics-tracker",
      keywords: "golf statistics, golf metrics"
    }
  ];

  return (
    <section className="py-16 bg-background/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Golf Resources & Guides</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Improve your golf game with our comprehensive guides on score tracking, analytics, and performance improvement
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {resources.map((resource, index) => {
            const IconComponent = resource.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-2 mb-2">
                    <IconComponent className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                  </div>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground mb-3">
                    Topics: {resource.keywords}
                  </div>
                  <Link to={resource.link}>
                    <Button variant="outline" size="sm" className="w-full">
                      Read Guide
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
