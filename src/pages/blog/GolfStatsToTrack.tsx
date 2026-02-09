import { useEffect } from "react";
import { BlogScoreTrackingCTA } from "@/components/BlogScoreTrackingCTA";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Target, TrendingUp, Crosshair, HelpCircle } from "lucide-react";

export default function GolfStatsToTrack() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Golf Stats You Should Track to Improve Your Game",
    "description": "Discover the most important golf statistics to track. From fairways hit to putts per round, learn which stats reveal where you're losing strokes and how to improve.",
    "image": "https://mybirdieboard.com/og-image.png",
    "author": { "@type": "Organization", "name": "MyBirdieBoard" },
    "publisher": {
      "@type": "Organization",
      "name": "MyBirdieBoard",
      "logo": { "@type": "ImageObject", "url": "https://mybirdieboard.com/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png" }
    },
    "datePublished": "2026-02-07",
    "dateModified": "2026-02-07",
    "mainEntityOfPage": { "@type": "WebPage", "@id": "https://mybirdieboard.com/blog/golf-stats-to-track" }
  };

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What golf stats should I track?",
        "acceptedAnswer": { "@type": "Answer", "text": "The most important golf stats to track are: Fairways Hit (FIR), Greens in Regulation (GIR), Putts per Round, Up & Down percentage, Penalty strokes, and Score relative to par. These six metrics cover every part of your game and reveal exactly where you're losing strokes." }
      },
      {
        "@type": "Question",
        "name": "What is the most important golf stat?",
        "acceptedAnswer": { "@type": "Answer", "text": "Greens in Regulation (GIR) is widely considered the most important stat because it has the strongest correlation with scoring. PGA Tour pros hit about 65% of greens; the average amateur hits 25-30%. Increasing your GIR percentage has the biggest impact on your score." }
      },
      {
        "@type": "Question",
        "name": "How do I start tracking golf stats?",
        "acceptedAnswer": { "@type": "Answer", "text": "Start simple: track your score, putts, and fairways/greens hit per hole. You can do this on a paper scorecard or use an app like MyBirdieBoard. After each round, review your stats to spot patterns. Over time, add more detailed tracking as you get comfortable." }
      }
    ]
  };

  return (
    <>
      <SEOHead
        title="Golf Stats You Should Track to Improve | MyBirdieBoard"
        description="Discover the most important golf statistics to track. From fairways hit to putts per round, learn which stats reveal where you're losing strokes and how to improve."
        keywords="golf stats to track, golf statistics, fairways in regulation, greens in regulation, putts per round, golf analytics, golf improvement stats"
      >
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">{JSON.stringify(faqData)}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mybirdieboard.com/" },
            { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://mybirdieboard.com/blog" },
            { "@type": "ListItem", "position": 3, "name": "Golf Stats to Track", "item": "https://mybirdieboard.com/blog/golf-stats-to-track" }
          ]
        })}</script>
      </SEOHead>

      <div className="min-h-screen bg-background">
        <header className="bg-primary text-white py-12">
          <div className="container mx-auto px-4">
            <BreadcrumbNav />
            <div className="mt-4">
              <Link to="/blog" className="inline-flex items-center text-white/80 hover:text-white mb-4">← Back to Blog</Link>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Golf Stats You Should Track to Improve</h1>
              <p className="text-lg text-white/90">The key statistics that reveal where you're losing strokes — and how to fix it</p>
              <div className="flex items-center gap-4 mt-4 text-white/70 text-sm">
                <span>February 7, 2026</span>
                <span>•</span>
                <span>11 min read</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto py-12 px-4">
          <article className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <p className="lead text-xl text-muted-foreground">
              Most golfers know their handicap and their best score, but few track the statistics that actually explain <em>why</em> they shoot what they shoot. The right stats tell you exactly where your strokes are going — and where the biggest improvement opportunities are hiding.
            </p>

            <h2 className="flex items-center gap-2 mt-10"><Crosshair className="h-6 w-6 text-primary" /> The 6 Essential Golf Stats</h2>
            <p>If you track nothing else, track these six statistics. Together, they cover every phase of the game:</p>

            <h3>1. Fairways in Regulation (FIR)</h3>
            <p>
              <strong>What it measures:</strong> Percentage of tee shots that land in the fairway on par 4s and par 5s (typically 14 holes per round).
            </p>
            <p>
              <strong>Why it matters:</strong> Hitting fairways gives you a clean lie, a clear path to the green, and shorter approach shots. Missing fairways leads to penalty strokes, difficult recovery shots, and higher scores.
            </p>
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border px-4 py-3 text-left font-semibold">Level</th>
                    <th className="border border-border px-4 py-3 text-left font-semibold">FIR %</th>
                    <th className="border border-border px-4 py-3 text-left font-semibold">Fairways per Round</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-border px-4 py-2">PGA Tour</td><td className="border border-border px-4 py-2">60-65%</td><td className="border border-border px-4 py-2">8-9</td></tr>
                  <tr className="bg-muted/50"><td className="border border-border px-4 py-2">Low Handicap (0-9)</td><td className="border border-border px-4 py-2">50-60%</td><td className="border border-border px-4 py-2">7-8</td></tr>
                  <tr><td className="border border-border px-4 py-2">Mid Handicap (10-18)</td><td className="border border-border px-4 py-2">40-50%</td><td className="border border-border px-4 py-2">6-7</td></tr>
                  <tr className="bg-muted/50"><td className="border border-border px-4 py-2">High Handicap (19+)</td><td className="border border-border px-4 py-2">25-40%</td><td className="border border-border px-4 py-2">4-5</td></tr>
                </tbody>
              </table>
            </div>

            <h3>2. Greens in Regulation (GIR)</h3>
            <p>
              <strong>What it measures:</strong> The percentage of holes where your ball is on the putting surface in the expected number of strokes (par minus 2). For example, reaching a par 4 green in 2 shots.
            </p>
            <p>
              <strong>Why it matters:</strong> GIR has the <strong>strongest correlation with scoring</strong> of any stat. More greens hit = more birdie chances and fewer scrambling situations. This is widely considered the single most important stat in golf.
            </p>

            <h3>3. Putts Per Round</h3>
            <p>
              <strong>What it measures:</strong> Total number of putts per 18 holes.
            </p>
            <p>
              <strong>Why it matters:</strong> Putting accounts for about 40% of your total strokes. Reducing three-putts is one of the fastest ways to lower scores. For a deeper dive, read our guide on <Link to="/blog/putts-per-round" className="text-primary hover:underline">how many putts per round is good</Link>.
            </p>

            <h3>4. Up & Down (Scrambling) Percentage</h3>
            <p>
              <strong>What it measures:</strong> When you miss the green, how often do you still make par or better (chip/pitch + one putt).
            </p>
            <p>
              <strong>Why it matters:</strong> Even tour pros miss 35% of greens. Your ability to recover defines whether a missed green costs you one stroke or two. PGA Tour scrambling is around 60%; most amateurs are below 30%.
            </p>

            <h3>5. Penalty Strokes Per Round</h3>
            <p>
              <strong>What it measures:</strong> The number of penalty strokes incurred from out-of-bounds, water hazards, lost balls, or unplayable lies.
            </p>
            <p>
              <strong>Why it matters:</strong> Penalties are pure waste — they add strokes without any benefit. High-handicap golfers often lose 3-6 strokes per round to penalties. Simply keeping the ball in play can transform your scores. See our <Link to="/blog/course-management-tips" className="text-primary hover:underline">course management tips</Link> for strategies.
            </p>

            <h3>6. Score Relative to Par (by Hole Type)</h3>
            <p>
              <strong>What it measures:</strong> Your average score on par 3s, par 4s, and par 5s separately.
            </p>
            <p>
              <strong>Why it matters:</strong> This reveals whether your weakness is on a specific hole type. Many golfers lose the most strokes on par 3s (where a missed green usually means bogey or worse) or long par 4s (where they attempt shots beyond their ability).
            </p>

            <h2 className="flex items-center gap-2 mt-10"><TrendingUp className="h-6 w-6 text-primary" /> Advanced Stats Worth Tracking</h2>
            <p>Once you're comfortable with the essentials, consider adding these:</p>

            <Card className="my-6 bg-muted/30">
              <CardContent className="p-6">
                <ul className="space-y-3 text-base">
                  <li><strong>Putts per GIR</strong> — Putting performance only on holes where you hit the green (removes chip-and-putt bias)</li>
                  <li><strong>Driving Distance</strong> — Average carry distance off the tee; useful for club selection decisions</li>
                  <li><strong>Sand Save %</strong> — How often you get up and down from bunkers</li>
                  <li><strong>Par 3 Scoring Average</strong> — Isolates your iron play and short game on the most revealing hole type</li>
                  <li><strong>Three-Putt Avoidance</strong> — Percentage of holes without a three-putt; directly tied to lag putting skill</li>
                </ul>
              </CardContent>
            </Card>

            <h2 className="flex items-center gap-2 mt-10"><BarChart3 className="h-6 w-6 text-primary" /> How to Use Your Stats</h2>

            <h3>Find Your Biggest Leak</h3>
            <p>
              Compare your stats to the benchmarks above. The category where you're furthest from the next level is likely where you'll gain the most strokes. For example, if you're a 15-handicap hitting only 3 fairways per round, working on driving accuracy will have a bigger impact than putting drills.
            </p>

            <h3>Track Trends, Not Single Rounds</h3>
            <p>
              One round of data is meaningless. Look at trends over 10-20 rounds. Is your GIR improving? Are your putts per round trending down? With <Link to="/" className="text-primary hover:underline">MyBirdieBoard</Link>, you can visualize these trends automatically with charts and progression graphs.
            </p>

            <h3>Set Specific Practice Goals</h3>
            <p>
              Instead of "practice more," use your stats to set targets: "Increase FIR from 40% to 50% over the next 10 rounds" or "Reduce three-putts from 3 per round to 1." Specific, measurable goals lead to focused practice that actually improves your scores.
            </p>

            <h2 className="flex items-center gap-2 mt-10"><HelpCircle className="h-6 w-6 text-primary" /> Frequently Asked Questions</h2>

            <h3>What golf stats should I track?</h3>
            <p>At minimum, track Fairways Hit, Greens in Regulation, Putts per Round, Up & Down percentage, Penalty strokes, and Score relative to par. These six metrics cover every part of your game.</p>

            <h3>What is the most important golf stat?</h3>
            <p>Greens in Regulation (GIR) has the strongest correlation with scoring. Increasing your GIR percentage has the biggest single impact on lowering your handicap.</p>

            <h3>How do I start tracking golf stats?</h3>
            <p>Start simple — track your score, putts, and fairways/greens hit per hole on a scorecard or app. After each round, review patterns. <Link to="/guides/golf-statistics-tracker" className="text-primary hover:underline">Our golf statistics tracker guide</Link> walks you through the full process.</p>

            {/* Internal links */}
            <div className="mt-12 p-6 bg-accent/10 rounded-lg not-prose">
              <h3 className="text-xl font-semibold mb-4">Related Articles</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/blog/putts-per-round" className="text-primary hover:underline">How Many Putts Per Round is Good?</Link></li>
                <li><Link to="/blog/how-to-calculate-golf-handicap" className="text-primary hover:underline">How to Calculate Golf Handicap (Beginner Guide)</Link></li>
                <li><Link to="/blog/how-to-break-100" className="text-primary hover:underline">How to Break 100 in Golf</Link></li>
                <li><Link to="/guides/golf-performance-analytics" className="text-primary hover:underline">Golf Performance Analytics Guide</Link></li>
                <li><Link to="/guides/golf-statistics-tracker" className="text-primary hover:underline">Golf Statistics Tracker Guide</Link></li>
              </ul>
            </div>

            <div className="mt-12 text-center not-prose">
              <div className="bg-primary/10 rounded-lg p-8">
                <h3 className="text-2xl font-semibold mb-4">Start Tracking Your Golf Stats</h3>
                <p className="text-muted-foreground mb-6">Log rounds, track every stat that matters, and see where your strokes are going</p>
                <Link to="/"><Button size="lg" className="bg-accent hover:bg-accent/90">Get Started Free</Button></Link>
              </div>
            </div>
            <BlogScoreTrackingCTA />
          </article>
        </main>
      </div>
    </>
  );
}
