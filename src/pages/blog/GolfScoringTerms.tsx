
import { useState } from "react";
import { BlogScoreTrackingCTA } from "@/components/BlogScoreTrackingCTA";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LoginDialog } from "@/components/LoginDialog";
import { User, ArrowLeft } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

export default function GolfScoringTerms() {
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  return (
    <>
      <SEOHead
        title="Golf Scoring Terms Explained: Birdie, Bogey, Eagle & More | MyBirdieBoard"
        description="Learn every golf scoring term from birdie and bogey to eagle, albatross, and double bogey. A simple guide to understanding golf scorecard terminology for beginners."
        keywords="golf scoring terms, birdie in golf, bogey meaning, eagle golf, albatross golf, par in golf, double bogey, golf terminology, golf scorecard terms"
        ogType="article"
        lastModified="2026-02-18T10:00:00Z"
      >
        <meta property="article:published_time" content="2026-02-18T10:00:00Z" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mybirdieboard.com/" },
              { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://mybirdieboard.com/blog" },
              { "@type": "ListItem", "position": 3, "name": "Golf Scoring Terms Explained", "item": "https://mybirdieboard.com/blog/golf-scoring-terms" }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Golf Scoring Terms Explained: Birdie, Bogey, Eagle & More",
            "image": "https://mybirdieboard.com/og-image.png",
            "url": "https://mybirdieboard.com/blog/golf-scoring-terms",
            "datePublished": "2026-02-18T10:00:00Z",
            "dateModified": "2026-02-18T10:00:00Z",
            "author": { "@type": "Organization", "name": "MyBirdieBoard" },
            "publisher": { "@type": "Organization", "name": "MyBirdieBoard", "logo": { "@type": "ImageObject", "url": "https://mybirdieboard.com/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png" } },
            "mainEntityOfPage": { "@type": "WebPage", "@id": "https://mybirdieboard.com/blog/golf-scoring-terms" }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "What does birdie mean in golf?", "acceptedAnswer": { "@type": "Answer", "text": "A birdie is a score of one stroke under par on a hole. For example, scoring 3 on a par 4 is a birdie. The term originated in early 1900s American golf slang, where 'bird' meant something excellent." } },
              { "@type": "Question", "name": "What is the difference between a bogey and a double bogey?", "acceptedAnswer": { "@type": "Answer", "text": "A bogey is one stroke over par on a hole, while a double bogey is two strokes over par. For example, on a par 4, a bogey is a score of 5 and a double bogey is a score of 6." } },
              { "@type": "Question", "name": "Has anyone ever scored a condor in golf?", "acceptedAnswer": { "@type": "Answer", "text": "A condor — four under par on a single hole — is the rarest score in golf. It has only been achieved a handful of times in recorded history, typically as a hole-in-one on a par 5." } },
              { "@type": "Question", "name": "What does 'par' mean in golf?", "acceptedAnswer": { "@type": "Answer", "text": "Par is the number of strokes an expert golfer is expected to take on a hole or course. Most holes are par 3, par 4, or par 5. Scoring par means you completed the hole in the expected number of strokes." } }
            ]
          })}
        </script>
      </SEOHead>
      
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-white py-8">
          <div className="container mx-auto px-4">
            <BreadcrumbNav />
            <div className="mt-4">
              <Link to="/blog" className="inline-flex items-center text-white/80 hover:text-white mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold">Golf Scoring Terms Explained: Birdie, Bogey, Eagle & More</h1>
              <p className="text-lg mt-2 text-white/90">A complete guide to understanding every score name on the golf scorecard</p>
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
          <article className="max-w-4xl mx-auto prose prose-lg max-w-none">
            <div className="mb-8">
              <p className="text-muted-foreground">Published on February 18, 2026 • 9 min read</p>
            </div>

            <p className="text-xl text-muted-foreground mb-8">
              If you're new to golf — or just want to finally understand what "albatross" means — this guide covers every scoring term you'll hear on the course, from the common to the extremely rare.
            </p>

            <h2>What Is Par?</h2>
            <p>
              Before understanding any scoring term, you need to know <strong>par</strong>. Par is the number of strokes an expert golfer is expected to complete a hole in. It accounts for the tee shot, approach shots, and two putts on the green.
            </p>
            <ul>
              <li><strong>Par 3</strong> — typically shorter holes, up to about 250 yards</li>
              <li><strong>Par 4</strong> — medium-length holes, usually 250–470 yards</li>
              <li><strong>Par 5</strong> — the longest holes, usually 470+ yards</li>
            </ul>
            <p>
              A standard 18-hole course has a total par of around 70–72. Every other scoring term is defined by its relationship to par.
            </p>

            <h2>The Complete Golf Scoring Terms Table</h2>
            <p>Here's a quick reference for every scoring term relative to par:</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-3 border-b font-semibold">Term</th>
                    <th className="text-left p-3 border-b font-semibold">Score vs Par</th>
                    <th className="text-left p-3 border-b font-semibold">Example (Par 4)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border-b font-medium">Condor</td>
                    <td className="p-3 border-b">4 under par</td>
                    <td className="p-3 border-b">—  (only possible on par 5+)</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b font-medium">Albatross (Double Eagle)</td>
                    <td className="p-3 border-b">3 under par</td>
                    <td className="p-3 border-b">Hole-in-one on a par 4</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b font-medium">Eagle</td>
                    <td className="p-3 border-b">2 under par</td>
                    <td className="p-3 border-b">Score of 2</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b font-medium">Birdie</td>
                    <td className="p-3 border-b">1 under par</td>
                    <td className="p-3 border-b">Score of 3</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b font-medium">Par</td>
                    <td className="p-3 border-b">Even</td>
                    <td className="p-3 border-b">Score of 4</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b font-medium">Bogey</td>
                    <td className="p-3 border-b">1 over par</td>
                    <td className="p-3 border-b">Score of 5</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b font-medium">Double Bogey</td>
                    <td className="p-3 border-b">2 over par</td>
                    <td className="p-3 border-b">Score of 6</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b font-medium">Triple Bogey</td>
                    <td className="p-3 border-b">3 over par</td>
                    <td className="p-3 border-b">Score of 7</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b font-medium">Quadruple Bogey+</td>
                    <td className="p-3 border-b">4+ over par</td>
                    <td className="p-3 border-b">Score of 8+</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>Under-Par Scores Explained</h2>

            <h3>Birdie (1 Under Par)</h3>
            <p>
              A <strong>birdie</strong> is the most common under-par score. It means completing a hole in one stroke fewer than par — for example, scoring 3 on a par 4 or 2 on a par 3.
            </p>
            <p>
              The term originated in the early 1900s at the Atlantic City Country Club in the United States. In American slang at the time, "bird" meant something excellent or outstanding. A player who hit an exceptional shot described it as a "bird of a shot," which was eventually shortened to "birdie."
            </p>
            <p>
              For most amateur golfers, birdies are celebratory moments. PGA Tour professionals average around 3–4 birdies per round, while a mid-handicap golfer might make one or two per round on a good day.
            </p>

            <h3>Eagle (2 Under Par)</h3>
            <p>
              An <strong>eagle</strong> means completing a hole in two strokes under par. On a par 5, that's a score of 3. On a par 4, it's a score of 2 — effectively holing out from the fairway or a long chip.
            </p>
            <p>
              Eagles are relatively rare for amateur golfers. They most commonly occur on par 5s when a player reaches the green in two shots and sinks the putt. For professionals, eagles happen a few times per tournament, usually on reachable par 5s.
            </p>
            <p>
              The name follows the bird theme — an eagle being a bigger, more impressive bird than the birdie.
            </p>

            <h3>Albatross / Double Eagle (3 Under Par)</h3>
            <p>
              An <strong>albatross</strong> — called a <strong>double eagle</strong> in the United States — is three strokes under par. This typically means a score of 2 on a par 5 or a hole-in-one on a par 4.
            </p>
            <p>
              Albatrosses are extremely rare. Even on the PGA Tour, they happen only a handful of times each season. For amateur golfers, an albatross is a once-in-a-lifetime achievement — if it happens at all.
            </p>
            <p>
              The name continues the bird-naming tradition, with the albatross being one of the largest and most majestic seabirds.
            </p>

            <h3>Condor (4 Under Par)</h3>
            <p>
              A <strong>condor</strong> is the rarest score in golf: four strokes under par on a single hole. This can only happen as a hole-in-one on a par 5, or a 2 on a par 6 (which is itself extremely uncommon).
            </p>
            <p>
              There are only a handful of verified condors in the history of golf, all achieved under unusual circumstances — typically on short, downhill, dogleg par 5s where the ball cut the corner and rolled into the hole. It's one of those feats that's more theoretical than practical for most golfers.
            </p>

            <h2>Over-Par Scores Explained</h2>

            <h3>Bogey (1 Over Par)</h3>
            <p>
              A <strong>bogey</strong> is one stroke over par. On a par 4, that's a score of 5. The term has an interesting origin — it comes from "The Bogey Man" in a late 19th-century British song. In early golf, the "bogey" was the score a good amateur was expected to make, before the concept of "par" (representing an expert score) replaced it. Over time, bogey shifted to mean one over par.
            </p>
            <p>
              For mid- to high-handicap golfers, bogeys are the bread and butter of most rounds. A "bogey golfer" (someone who averages about one over par per hole) would shoot around 90 on a par-72 course. If you're working on <Link to="/blog/how-to-break-100" className="text-primary hover:underline">breaking 100</Link>, limiting your double and triple bogeys while making more bogeys is the fastest path to improvement.
            </p>

            <h3>Double Bogey (2 Over Par)</h3>
            <p>
              A <strong>double bogey</strong> is two strokes over par — a score of 6 on a par 4, for instance. Double bogeys are the scores that tend to inflate rounds the most. A golfer who plays mostly bogeys but has three or four double bogeys can easily add 6–8 strokes to their round.
            </p>
            <p>
              Tracking where your double bogeys happen is one of the most useful things you can do with a <Link to="/" className="text-primary hover:underline">golf score tracker</Link>. Are they concentrated on long par 4s? Holes with water? Knowing the pattern helps you make smarter decisions.
            </p>

            <h3>Triple Bogey and Beyond</h3>
            <p>
              A <strong>triple bogey</strong> is three over par, and anything worse is simply described by the number — quadruple bogey, etc. These are sometimes called "blow-up holes" or "others" on scorecards.
            </p>
            <p>
              For beginners and high-handicap golfers, these scores are common and nothing to be embarrassed about. The key is understanding <em>why</em> they happen — was it a lost ball, a penalty, or simply too many putts? Analysing your <Link to="/guides/golf-performance-metrics" className="text-primary hover:underline">performance metrics</Link> helps turn these big numbers into learning opportunities.
            </p>

            <h2>Other Golf Scoring Terms You Should Know</h2>

            <h3>Ace / Hole-in-One</h3>
            <p>
              An <strong>ace</strong> is when you sink the ball directly from the tee in one stroke. On a par 3, a hole-in-one equals a birdie (–1). On a par 4, it's an albatross (–3). On a par 5, it would be a condor (–4). The odds of a recreational golfer making a hole-in-one are roughly 1 in 12,500.
            </p>

            <h3>Scratch Golfer</h3>
            <p>
              A <strong>scratch golfer</strong> is someone with a handicap of 0 — they are expected to shoot par on any course, accounting for difficulty. This term isn't a score for a single hole but describes overall playing ability. Learn more about <Link to="/blog/understanding-golf-handicap-system" className="text-primary hover:underline">how the handicap system works</Link>.
            </p>

            <h3>Gross vs Net Score</h3>
            <p>
              Your <strong>gross score</strong> is your actual total strokes. Your <strong>net score</strong> is your gross score minus your handicap strokes. Net scoring is used in most amateur competitions to level the playing field between golfers of different abilities.
            </p>

            <h3>Stableford Points</h3>
            <p>
              <Link to="/blog/stableford-scoring" className="text-primary hover:underline">Stableford scoring</Link> is a points-based system where each hole score earns points relative to par. A bogey earns 1 point, par earns 2, birdie earns 3, and eagle earns 4. The advantage is that a blow-up hole only costs you zero points rather than adding a large number to your total.
            </p>

            <h2>How Scoring Terms Appear on Your Scorecard</h2>
            <p>
              On a traditional scorecard, you'll typically see your hole scores marked relative to par with visual indicators:
            </p>
            <ul>
              <li><strong>Double circle</strong> — eagle or better</li>
              <li><strong>Single circle</strong> — birdie</li>
              <li><strong>No marking</strong> — par</li>
              <li><strong>Single square</strong> — bogey</li>
              <li><strong>Double square</strong> — double bogey or worse</li>
            </ul>
            <p>
              When you use a digital <Link to="/" className="text-primary hover:underline">golf score tracker</Link> like MyBirdieBoard, these are calculated and displayed automatically. You can see at a glance how many birdies, pars, bogeys, and worse you had in any round — and track those trends over time.
            </p>

            <h2>Why Understanding Scoring Terms Matters</h2>
            <p>
              Knowing these terms isn't just about fitting in at the clubhouse. When you understand what each score means relative to par, you can:
            </p>
            <ul>
              <li><strong>Read your scorecard</strong> and instantly understand your round</li>
              <li><strong>Set meaningful goals</strong> — "I want to make more pars than bogeys" is a concrete target</li>
              <li><strong>Follow professional golf</strong> — broadcasts constantly reference birdies, eagles, and bogeys</li>
              <li><strong>Track improvement</strong> — seeing your birdie percentage increase over time is deeply motivating</li>
              <li><strong>Communicate with other golfers</strong> — "I had three birdies but a triple on 14" tells a complete story</li>
            </ul>
            <p>
              If you're tracking your scores with MyBirdieBoard, you'll see exactly how many of each score type you make per round and how that changes over time. It's one of the most satisfying parts of seeing your <Link to="/guides/golf-performance-analytics" className="text-primary hover:underline">golf analytics</Link> data.
            </p>

            <h2>Frequently Asked Questions</h2>

            <h3>What does birdie mean in golf?</h3>
            <p>
              A birdie is a score of one stroke under par on a hole. For example, scoring 3 on a par 4 is a birdie. The term originated in early 1900s American golf slang, where "bird" meant something excellent.
            </p>

            <h3>What is the difference between a bogey and a double bogey?</h3>
            <p>
              A bogey is one stroke over par on a hole, while a double bogey is two strokes over par. For example, on a par 4, a bogey is a score of 5 and a double bogey is a score of 6.
            </p>

            <h3>Has anyone ever scored a condor in golf?</h3>
            <p>
              A condor — four under par on a single hole — is the rarest score in golf. It has only been achieved a handful of times in recorded history, typically as a hole-in-one on a par 5.
            </p>

            <h3>What does "par" mean in golf?</h3>
            <p>
              Par is the number of strokes an expert golfer is expected to take on a hole or course. Most holes are par 3, par 4, or par 5. Scoring par means you completed the hole in the expected number of strokes.
            </p>

            <div className="bg-accent/10 rounded-lg p-8 mt-12">
              <h3>Track Every Birdie, Bogey & Eagle</h3>
              <p className="mb-4">MyBirdieBoard automatically breaks down your scores by type so you can see exactly where your game stands — and where it's improving.</p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Related Reading:</h4>
                  <ul className="space-y-1 text-sm">
                    <li><Link to="/blog/stableford-scoring" className="text-primary hover:underline">What is Stableford Scoring in Golf?</Link></li>
                    <li><Link to="/blog/match-play-scoring" className="text-primary hover:underline">How to Keep Score in Match Play Golf</Link></li>
                    <li><Link to="/blog/how-to-break-100" className="text-primary hover:underline">How to Break 100 in Golf: 15 Proven Tips</Link></li>
                    <li><Link to="/blog/golf-stats-to-track" className="text-primary hover:underline">Golf Stats You Should Track to Improve</Link></li>
                  </ul>
                </div>
                <Link to="/">
                  <Button size="lg" className="bg-accent hover:bg-accent/90">
                    Start Tracking Your Scores
                  </Button>
                </Link>
              </div>
            </div>
            <BlogScoreTrackingCTA />
          </article>
        </main>
        
        <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
      </div>
    </>
  );
}
