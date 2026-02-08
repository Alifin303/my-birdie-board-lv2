import { useEffect } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Calculator, TrendingUp, CheckCircle } from "lucide-react";

export default function StablefordScoring() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "What is Stableford Scoring in Golf? Complete Guide & Calculator",
    "description": "Learn how Stableford scoring works in golf, how to calculate points, and why it's a popular alternative to stroke play. Track your Stableford scores with MyBirdieBoard.",
    "image": "https://mybirdieboard.com/og-image.png",
    "author": {
      "@type": "Organization",
      "name": "MyBirdieBoard"
    },
    "publisher": {
      "@type": "Organization",
      "name": "MyBirdieBoard",
      "logo": {
        "@type": "ImageObject",
        "url": "https://mybirdieboard.com/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png"
      }
    },
    "datePublished": "2025-01-25",
    "dateModified": "2026-01-24",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://mybirdieboard.com/blog/stableford-scoring"
    }
  };

  return (
    <>
      <SEOHead
        title="What is Stableford Scoring in Golf? Complete Guide & Calculator | MyBirdieBoard"
        description="Learn how Stableford scoring works in golf, how to calculate points for each hole, and why it's a popular alternative to stroke play. Track Stableford scores with MyBirdieBoard."
        keywords="stableford scoring, stableford points, golf stableford, stableford calculator, stableford scoring system, net stableford, gross stableford, golf scoring methods"
        ogType="article"
        lastModified="2026-01-24T10:00:00Z"
      >
        <meta property="article:published_time" content="2025-01-25T10:00:00Z" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mybirdieboard.com/" },
              { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://mybirdieboard.com/blog" },
              { "@type": "ListItem", "position": 3, "name": "Stableford Scoring", "item": "https://mybirdieboard.com/blog/stableford-scoring" }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "What is Stableford scoring in golf?", "acceptedAnswer": { "@type": "Answer", "text": "Stableford is a points-based scoring system where you earn points based on your score relative to par on each hole. Par earns 2 points, birdie 3, eagle 4, bogey 1, and double bogey or worse 0. Higher points is better, unlike stroke play." } },
              { "@type": "Question", "name": "What is a good Stableford score?", "acceptedAnswer": { "@type": "Answer", "text": "For 18 holes, 36 points is considered playing to your handicap. Above 36 is a strong round. 30-35 points is solid, 24-29 is average, and below 24 is a tough day." } },
              { "@type": "Question", "name": "What is the difference between gross and net Stableford?", "acceptedAnswer": { "@type": "Answer", "text": "Gross Stableford uses your actual score compared to par. Net Stableford applies handicap strokes to specific holes based on the stroke index, levelling the playing field for players of different abilities." } }
            ]
          })}
        </script>
      </SEOHead>

      <div className="min-h-screen bg-background">
        <header className="bg-primary text-white py-12">
          <div className="container mx-auto px-4">
            <BreadcrumbNav />
            <div className="mt-4">
              <Link to="/blog" className="inline-flex items-center text-white/80 hover:text-white mb-4">
                ← Back to Blog
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                What is Stableford Scoring in Golf?
              </h1>
              <p className="text-lg text-white/90 max-w-2xl">
                A complete guide to understanding, calculating, and tracking Stableford points
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm text-white/70">
                <span>January 25, 2025</span>
                <span>•</span>
                <span>10 min read</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto py-12 px-4">
          <article className="max-w-3xl mx-auto prose prose-lg">
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Introduction to Stableford Scoring</h2>
              <p className="text-muted-foreground mb-4">
                Stableford is a popular golf scoring system that awards points based on your score relative to par on each hole. 
                Unlike traditional stroke play where lower is better, in Stableford <strong>higher points mean better performance</strong>.
              </p>
              <p className="text-muted-foreground mb-4">
                The system was invented by Dr. Frank Stableford in 1931 and was first used at Wallasey Golf Club in England. 
                It has since become one of the most widely used scoring formats in amateur golf competitions worldwide.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-foreground">How Stableford Points Are Calculated</h2>
              <p className="text-muted-foreground mb-4">
                In Stableford scoring, you receive points based on how your score on each hole compares to par:
              </p>
              
              <div className="grid gap-4 my-6">
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-semibold">Albatross (3 under par)</p>
                        <p className="text-muted-foreground">5 points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-green-400">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-green-400" />
                      <div>
                        <p className="font-semibold">Eagle (2 under par)</p>
                        <p className="text-muted-foreground">4 points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-semibold">Birdie (1 under par)</p>
                        <p className="text-muted-foreground">3 points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">Par</p>
                        <p className="text-muted-foreground">2 points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-semibold">Bogey (1 over par)</p>
                        <p className="text-muted-foreground">1 point</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-semibold">Double bogey or worse</p>
                        <p className="text-muted-foreground">0 points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Gross vs Net Stableford</h2>
              
              <div className="grid md:grid-cols-2 gap-6 my-6">
                <Card>
                  <CardContent className="p-6">
                    <Calculator className="h-8 w-8 text-primary mb-3" />
                    <h3 className="text-xl font-semibold mb-2">Gross Stableford</h3>
                    <p className="text-muted-foreground text-sm">
                      Points are calculated using your actual score on each hole compared to par, 
                      without any handicap adjustments. This is a pure measure of your scoring ability.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <TrendingUp className="h-8 w-8 text-accent mb-3" />
                    <h3 className="text-xl font-semibold mb-2">Net Stableford</h3>
                    <p className="text-muted-foreground text-sm">
                      Your handicap strokes are applied to specific holes based on their stroke index. 
                      This levels the playing field and is commonly used in club competitions.
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <h3 className="text-xl font-semibold mb-3 text-foreground">How Net Stableford Works</h3>
              <p className="text-muted-foreground mb-4">
                In net Stableford, your course handicap determines how many strokes you receive. These strokes 
                are distributed across holes based on the stroke index (hole handicap):
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>If your course handicap is 18 or less, you receive 1 stroke on holes with stroke index ≤ your handicap</li>
                <li>If your course handicap is over 18, you receive 2 strokes on holes with stroke index ≤ (handicap - 18)</li>
                <li>Your net score on each hole is calculated, then converted to Stableford points</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Why Play Stableford?</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Faster Pace of Play</h4>
                    <p className="text-muted-foreground text-sm">
                      Once you can't score any points on a hole, you can pick up and move on. 
                      No need to putt out when you've already made double bogey.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Less Discouraging</h4>
                    <p className="text-muted-foreground text-sm">
                      A disastrous hole won't ruin your entire round. You simply get 0 points 
                      and move on — there's no snowball effect on your total score.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Rewards Good Holes</h4>
                    <p className="text-muted-foreground text-sm">
                      Birdies and eagles earn bonus points, encouraging aggressive play 
                      when you have opportunities to score well.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Fair Competition</h4>
                    <p className="text-muted-foreground text-sm">
                      With net Stableford, players of all abilities can compete fairly. 
                      Handicaps help level the playing field.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Stableford Scoring Example</h2>
              <p className="text-muted-foreground mb-4">
                Let's say you're playing a par 72 course and your round looks like this on the front nine:
              </p>
              
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-2 text-left">Hole</th>
                      <th className="border p-2">1</th>
                      <th className="border p-2">2</th>
                      <th className="border p-2">3</th>
                      <th className="border p-2">4</th>
                      <th className="border p-2">5</th>
                      <th className="border p-2">6</th>
                      <th className="border p-2">7</th>
                      <th className="border p-2">8</th>
                      <th className="border p-2">9</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2 font-medium">Par</td>
                      <td className="border p-2 text-center">4</td>
                      <td className="border p-2 text-center">3</td>
                      <td className="border p-2 text-center">5</td>
                      <td className="border p-2 text-center">4</td>
                      <td className="border p-2 text-center">4</td>
                      <td className="border p-2 text-center">3</td>
                      <td className="border p-2 text-center">5</td>
                      <td className="border p-2 text-center">4</td>
                      <td className="border p-2 text-center">4</td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-medium">Score</td>
                      <td className="border p-2 text-center">5</td>
                      <td className="border p-2 text-center">3</td>
                      <td className="border p-2 text-center">4</td>
                      <td className="border p-2 text-center">4</td>
                      <td className="border p-2 text-center">6</td>
                      <td className="border p-2 text-center">4</td>
                      <td className="border p-2 text-center">5</td>
                      <td className="border p-2 text-center">3</td>
                      <td className="border p-2 text-center">7</td>
                    </tr>
                    <tr className="bg-primary/10">
                      <td className="border p-2 font-medium">Points</td>
                      <td className="border p-2 text-center">1</td>
                      <td className="border p-2 text-center">2</td>
                      <td className="border p-2 text-center">3</td>
                      <td className="border p-2 text-center">2</td>
                      <td className="border p-2 text-center">0</td>
                      <td className="border p-2 text-center">1</td>
                      <td className="border p-2 text-center">2</td>
                      <td className="border p-2 text-center">3</td>
                      <td className="border p-2 text-center">0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p className="text-muted-foreground">
                <strong>Front 9 Stableford Total: 14 points</strong> — A solid front nine with 2 birdies 
                offsetting the double bogeys.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-foreground">What's a Good Stableford Score?</h2>
              <p className="text-muted-foreground mb-4">
                For 18 holes, here's a rough guide to Stableford scores:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>36+ points (Gross):</strong> Excellent round, playing to handicap or better</li>
                <li><strong>30-35 points:</strong> Good, solid round</li>
                <li><strong>24-29 points:</strong> Average round, room for improvement</li>
                <li><strong>Under 24 points:</strong> Challenging day on the course</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                For net Stableford with handicap strokes applied, 36 points is considered "playing to your handicap."
              </p>
            </section>

            <section className="bg-accent/10 rounded-lg p-8 mb-10">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Track Your Stableford Scores with MyBirdieBoard</h2>
              <p className="text-muted-foreground mb-6">
                MyBirdieBoard automatically calculates both <strong>gross and net Stableford scores</strong> for every round you track. 
                Simply enter your hole-by-hole scores, and we'll handle the rest — including applying your handicap strokes to the correct holes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 w-full sm:w-auto">
                    Start Tracking Free
                  </Button>
                </Link>
                <Link to="/faq">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Learn More
                  </Button>
                </Link>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Related Resources</h2>
              <div className="grid gap-4">
                <Link to="/guides/golf-handicap-calculator" className="text-primary hover:underline">
                  → Golf Handicap Calculator Guide
                </Link>
                <Link to="/guides/how-to-track-golf-scores" className="text-primary hover:underline">
                  → How to Track Golf Scores Effectively
                </Link>
                <Link to="/blog/understanding-golf-handicap-system" className="text-primary hover:underline">
                  → Understanding the Golf Handicap System
                </Link>
                <Link to="/faq" className="text-primary hover:underline">
                  → Frequently Asked Questions
                </Link>
              </div>
            </section>
          </article>
        </main>
      </div>
    </>
  );
}
