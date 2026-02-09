import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Calculator, Target, TrendingUp, Award } from "lucide-react";

const guides = [
  {
    title: "How to Track Golf Scores",
    description: "Learn the best methods for tracking your golf scores effectively. Digital tools, apps, and best practices for beginners and experienced golfers.",
    icon: BarChart3,
    link: "/guides/how-to-track-golf-scores",
  },
  {
    title: "Golf Handicap Calculator Guide",
    description: "Calculate and understand your golf handicap step by step using the official World Handicap System method.",
    icon: Calculator,
    link: "/guides/golf-handicap-calculator",
  },
  {
    title: "Best Golf Score Tracking Apps",
    description: "Compare the top golf score tracking apps. Features, pricing, and which app is right for your game.",
    icon: Target,
    link: "/guides/best-golf-score-tracking-apps",
  },
  {
    title: "Golf Performance Analytics",
    description: "Use data and analytics to improve your golf game. Learn to analyze stats, identify weaknesses, and track long-term progress.",
    icon: TrendingUp,
    link: "/guides/golf-performance-analytics",
  },
  {
    title: "Golf Statistics Tracker",
    description: "Essential golf statistics every golfer should monitor — fairways hit, greens in regulation, putts per round, and more.",
    icon: Award,
    link: "/guides/golf-statistics-tracker",
  },
];

export default function Guides() {
  return (
    <>
      <SEOHead
        title="Golf Guides — Score Tracking, Handicaps & Performance | MyBirdieBoard"
        description="In-depth golf guides covering score tracking, handicap calculation, performance analytics, and the best golf apps. Improve your game with data-driven insights."
        keywords="golf guides, golf score tracking guide, golf handicap guide, golf analytics, golf improvement"
      >
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mybirdieboard.com/" },
              { "@type": "ListItem", "position": 2, "name": "Guides", "item": "https://mybirdieboard.com/guides" },
            ],
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "MyBirdieBoard Golf Guides",
            "url": "https://mybirdieboard.com/guides",
            "description": "In-depth golf guides covering score tracking, handicap calculation, performance analytics, and the best golf apps.",
            "publisher": {
              "@type": "Organization",
              "name": "MyBirdieBoard",
              "logo": {
                "@type": "ImageObject",
                "url": "https://mybirdieboard.com/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png",
              },
            },
          })}
        </script>
      </SEOHead>

      <div className="min-h-screen bg-background">
        <header className="bg-primary text-white py-12">
          <div className="container mx-auto px-4">
            <BreadcrumbNav />
            <div className="mt-4">
              <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-4">
                ← Back to Home
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Golf Guides</h1>
              <p className="text-lg text-white/90">
                In-depth guides to help you track scores, understand handicaps, and improve your game with data
              </p>
            </div>
          </div>
        </header>

        <main className="container mx-auto py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-6 md:grid-cols-2">
              {guides.map((guide) => {
                const Icon = guide.icon;
                return (
                  <Card key={guide.link} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-1">
                        <Icon className="h-6 w-6 text-primary flex-shrink-0" aria-hidden="true" />
                        <CardTitle className="text-lg">
                          <Link to={guide.link} className="hover:text-primary transition-colors">
                            {guide.title}
                          </Link>
                        </CardTitle>
                      </div>
                      <CardDescription className="text-sm">{guide.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link to={guide.link}>
                        <Button variant="outline" size="sm" className="w-full">
                          Read Guide
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Cross-link to blog */}
            <div className="mt-16 bg-accent/10 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-semibold mb-4">Looking for More Tips?</h2>
              <p className="text-muted-foreground mb-6">
                Check out our golf blog for scoring tips, strategy advice, and performance insights.
              </p>
              <Link to="/blog">
                <Button variant="outline">Browse the Blog →</Button>
              </Link>
            </div>

            <div className="mt-12 text-center">
              <div className="bg-primary/10 rounded-lg p-8">
                <h3 className="text-2xl font-semibold mb-4">Ready to Track Your Golf Scores?</h3>
                <p className="text-muted-foreground mb-6">
                  Join thousands of golfers using MyBirdieBoard to improve their game
                </p>
                <Link to="/">
                  <Button size="lg" className="bg-accent hover:bg-accent/90">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
