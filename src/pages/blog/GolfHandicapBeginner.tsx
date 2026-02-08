import { useEffect } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, BookOpen, CheckCircle, HelpCircle } from "lucide-react";

export default function GolfHandicapBeginner() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "How to Calculate Golf Handicap: A Beginner's Guide",
    "description": "Learn how to calculate your golf handicap step by step. A simple beginner-friendly guide to the World Handicap System, score differentials, and handicap index.",
    "image": "https://mybirdieboard.com/og-image.png",
    "author": { "@type": "Organization", "name": "MyBirdieBoard" },
    "publisher": {
      "@type": "Organization",
      "name": "MyBirdieBoard",
      "logo": { "@type": "ImageObject", "url": "https://mybirdieboard.com/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png" }
    },
    "datePublished": "2026-02-07",
    "dateModified": "2026-02-07",
    "mainEntityOfPage": { "@type": "WebPage", "@id": "https://mybirdieboard.com/blog/how-to-calculate-golf-handicap" }
  };

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How many rounds do I need to get a handicap?",
        "acceptedAnswer": { "@type": "Answer", "text": "Under the World Handicap System, you can establish a handicap index with as few as 3 rounds of 18 holes (or 6 rounds of 9 holes). Your handicap becomes more accurate as you add more rounds, up to a maximum of 20 rounds in the calculation." }
      },
      {
        "@type": "Question",
        "name": "What is a score differential in golf?",
        "acceptedAnswer": { "@type": "Answer", "text": "A score differential adjusts your gross score based on the difficulty of the course you played. The formula is: (113 / Slope Rating) × (Adjusted Gross Score - Course Rating). This allows fair comparisons between scores on different courses." }
      },
      {
        "@type": "Question",
        "name": "What is a good handicap for a beginner?",
        "acceptedAnswer": { "@type": "Answer", "text": "Most beginners start with a handicap between 28 and 36. A handicap of 20-28 is typical after a few months of regular play. Getting below 20 usually takes dedicated practice and course management skills." }
      },
      {
        "@type": "Question",
        "name": "What is the difference between handicap index and course handicap?",
        "acceptedAnswer": { "@type": "Answer", "text": "Your handicap index is your portable number that travels with you. Your course handicap is adjusted for the specific course and tees you're playing. Course Handicap = Handicap Index × (Slope Rating / 113) + (Course Rating - Par)." }
      }
    ]
  };

  return (
    <>
      <SEOHead
        title="How to Calculate Golf Handicap: Beginner's Guide | MyBirdieBoard"
        description="Learn how to calculate your golf handicap step by step. A simple beginner-friendly guide to the World Handicap System, score differentials, and handicap index."
        keywords="how to calculate golf handicap, golf handicap for beginners, handicap index, score differential, World Handicap System, WHS beginner guide"
      >
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">{JSON.stringify(faqData)}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mybirdieboard.com/" },
            { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://mybirdieboard.com/blog" },
            { "@type": "ListItem", "position": 3, "name": "How to Calculate Golf Handicap", "item": "https://mybirdieboard.com/blog/how-to-calculate-golf-handicap" }
          ]
        })}</script>
      </SEOHead>

      <div className="min-h-screen bg-background">
        <header className="bg-primary text-white py-12">
          <div className="container mx-auto px-4">
            <BreadcrumbNav />
            <div className="mt-4">
              <Link to="/blog" className="inline-flex items-center text-white/80 hover:text-white mb-4">← Back to Blog</Link>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">How to Calculate Golf Handicap: A Beginner's Guide</h1>
              <p className="text-lg text-white/90">A simple, step-by-step explanation of the World Handicap System</p>
              <div className="flex items-center gap-4 mt-4 text-white/70 text-sm">
                <span>February 7, 2026</span>
                <span>•</span>
                <span>10 min read</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto py-12 px-4">
          <article className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <p className="lead text-xl text-muted-foreground">
              A golf handicap is a number that represents your playing ability. It allows golfers of different skill levels to compete fairly against each other. If you're new to golf, the handicap system can seem confusing — but the core concept is straightforward.
            </p>

            <h2 className="flex items-center gap-2 mt-10"><BookOpen className="h-6 w-6 text-primary" /> What is a Golf Handicap?</h2>
            <p>
              Your <strong>handicap index</strong> is a number (usually between 0 and 54) that indicates how many strokes above par you typically shoot. A 15-handicap golfer, for example, usually shoots about 15 over par on a course of average difficulty.
            </p>
            <p>
              The lower your handicap, the better you are. A "scratch" golfer has a handicap of 0, meaning they typically shoot par. Professional golfers often have handicaps in the plus range (e.g., +4), meaning they typically shoot below par.
            </p>

            <h2 className="flex items-center gap-2 mt-10"><Calculator className="h-6 w-6 text-primary" /> How the Handicap Calculation Works</h2>
            <p>The World Handicap System (WHS) uses a three-step process:</p>

            <h3>Step 1: Calculate Score Differentials</h3>
            <p>After each round, your score is adjusted for the difficulty of the course using this formula:</p>
            <Card className="my-4 bg-muted/50">
              <CardContent className="p-6 text-center">
                <p className="text-lg font-mono font-semibold">Score Differential = (113 ÷ Slope Rating) × (Adjusted Gross Score − Course Rating)</p>
              </CardContent>
            </Card>
            <ul>
              <li><strong>Adjusted Gross Score</strong> — Your actual score with maximum hole scores applied (net double bogey cap)</li>
              <li><strong>Course Rating</strong> — A number (usually 67-75) that represents the expected score of a scratch golfer on that course</li>
              <li><strong>Slope Rating</strong> — A number (55-155, with 113 being average) that represents how much harder the course is for a bogey golfer compared to a scratch golfer</li>
            </ul>

            <Card className="my-6 bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">Example Calculation</h4>
                <p className="text-muted-foreground">
                  You shoot <strong>92</strong> on a course with a Rating of <strong>71.2</strong> and Slope of <strong>128</strong>:<br />
                  Differential = (113 ÷ 128) × (92 − 71.2) = 0.883 × 20.8 = <strong>18.4</strong>
                </p>
              </CardContent>
            </Card>

            <h3>Step 2: Average Your Best Differentials</h3>
            <p>The system uses your <strong>best 8 out of your last 20 rounds</strong> to calculate your handicap. This means your bad rounds don't drag your handicap up too much — the system focuses on your potential, not your average.</p>

            <div className="overflow-x-auto my-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border px-4 py-3 text-left font-semibold">Rounds Available</th>
                    <th className="border border-border px-4 py-3 text-left font-semibold">Differentials Used</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-border px-4 py-2">3</td><td className="border border-border px-4 py-2">Lowest 1 − 2.0 adjustment</td></tr>
                  <tr className="bg-muted/50"><td className="border border-border px-4 py-2">4</td><td className="border border-border px-4 py-2">Lowest 1 − 1.0 adjustment</td></tr>
                  <tr><td className="border border-border px-4 py-2">5</td><td className="border border-border px-4 py-2">Lowest 1</td></tr>
                  <tr className="bg-muted/50"><td className="border border-border px-4 py-2">6</td><td className="border border-border px-4 py-2">Lowest 2</td></tr>
                  <tr><td className="border border-border px-4 py-2">7-8</td><td className="border border-border px-4 py-2">Lowest 2</td></tr>
                  <tr className="bg-muted/50"><td className="border border-border px-4 py-2">9-11</td><td className="border border-border px-4 py-2">Lowest 3</td></tr>
                  <tr><td className="border border-border px-4 py-2">12-14</td><td className="border border-border px-4 py-2">Lowest 4</td></tr>
                  <tr className="bg-muted/50"><td className="border border-border px-4 py-2">15-16</td><td className="border border-border px-4 py-2">Lowest 5</td></tr>
                  <tr><td className="border border-border px-4 py-2">17-18</td><td className="border border-border px-4 py-2">Lowest 6</td></tr>
                  <tr className="bg-muted/50"><td className="border border-border px-4 py-2">19</td><td className="border border-border px-4 py-2">Lowest 7</td></tr>
                  <tr><td className="border border-border px-4 py-2">20</td><td className="border border-border px-4 py-2">Lowest 8</td></tr>
                </tbody>
              </table>
            </div>

            <h3>Step 3: Convert to Handicap Index</h3>
            <p>Average those best differentials and truncate to one decimal place. That's your handicap index.</p>

            <h2 className="flex items-center gap-2 mt-10"><CheckCircle className="h-6 w-6 text-primary" /> Handicap Index vs. Course Handicap</h2>
            <p>Your handicap index is your <strong>portable number</strong> — it travels with you to any course. But when you play a specific course from specific tees, you need to convert it to a <strong>course handicap</strong>:</p>
            <Card className="my-4 bg-muted/50">
              <CardContent className="p-6 text-center">
                <p className="text-lg font-mono font-semibold">Course Handicap = Handicap Index × (Slope ÷ 113) + (Course Rating − Par)</p>
              </CardContent>
            </Card>
            <p>
              This adjustment ensures that on a harder course, you get more strokes, and on an easier course, you get fewer. Most golf apps and club pro shops will do this conversion for you automatically.
            </p>

            <h2 className="flex items-center gap-2 mt-10"><HelpCircle className="h-6 w-6 text-primary" /> Frequently Asked Questions</h2>

            <h3>How many rounds do I need to get a handicap?</h3>
            <p>You need a minimum of 3 rounds of 18 holes (or 6 rounds of 9 holes) to establish a handicap index. With <Link to="/" className="text-primary hover:underline">MyBirdieBoard</Link>, your handicap starts calculating as soon as you have enough rounds logged.</p>

            <h3>What is a good handicap for a beginner?</h3>
            <p>Most beginners start between 28 and 36. After a few months of regular play, getting below 20 is a realistic goal. See our guide on <Link to="/blog/how-to-break-100" className="text-primary hover:underline">how to break 100</Link> for practical tips.</p>

            <h3>What is the difference between handicap index and course handicap?</h3>
            <p>Your handicap index is your portable ability rating. Your course handicap is that number adjusted for the specific course and tees you're playing — accounting for course difficulty via slope and rating.</p>

            <h3>What is a score differential?</h3>
            <p>A score differential adjusts your raw score for course difficulty so scores from different courses can be compared fairly. It's the building block of the handicap calculation.</p>

            {/* Internal links */}
            <div className="mt-12 p-6 bg-accent/10 rounded-lg not-prose">
              <h3 className="text-xl font-semibold mb-4">Related Articles</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/blog/understanding-golf-handicap-system" className="text-primary hover:underline">Understanding the Golf Handicap System (Advanced)</Link></li>
                <li><Link to="/guides/golf-handicap-calculator" className="text-primary hover:underline">Golf Handicap Calculator Guide</Link></li>
                <li><Link to="/blog/stableford-scoring" className="text-primary hover:underline">What is Stableford Scoring?</Link></li>
                <li><Link to="/blog/golf-stats-to-track" className="text-primary hover:underline">Golf Stats You Should Track</Link></li>
                <li><Link to="/blog/how-to-break-100" className="text-primary hover:underline">How to Break 100 in Golf</Link></li>
              </ul>
            </div>

            <div className="mt-12 text-center not-prose">
              <div className="bg-primary/10 rounded-lg p-8">
                <h3 className="text-2xl font-semibold mb-4">Calculate Your Handicap Automatically</h3>
                <p className="text-muted-foreground mb-6">Log your rounds and MyBirdieBoard calculates your handicap index using the official WHS method</p>
                <Link to="/"><Button size="lg" className="bg-accent hover:bg-accent/90">Get Started Free</Button></Link>
              </div>
            </div>
          </article>
        </main>
      </div>
    </>
  );
}
