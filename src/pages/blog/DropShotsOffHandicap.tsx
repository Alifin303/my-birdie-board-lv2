import { useEffect } from "react";
import { BlogScoreTrackingCTA } from "@/components/BlogScoreTrackingCTA";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, Target, ClipboardList, Zap } from "lucide-react";

export default function DropShotsOffHandicap() {
  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Drop 5 Shots Off Your Handicap in One Season",
    description:
      "A practical, data-driven guide to lowering your golf handicap by 5 shots in a single season. Learn which stats to track, where amateurs actually lose strokes, and how to build a focused practice plan.",
    image: "https://mybirdieboard.com/og-image.png",
    author: { "@type": "Organization", name: "MyBirdieBoard" },
    publisher: {
      "@type": "Organization",
      name: "MyBirdieBoard",
      logo: {
        "@type": "ImageObject",
        url: "https://mybirdieboard.com/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png",
      },
    },
    datePublished: "2026-06-15",
    dateModified: "2026-06-15T10:00:00Z",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://mybirdieboard.com/blog/how-to-drop-shots-off-handicap",
    },
  };

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How long does it take to drop 5 shots off your handicap?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "For most amateurs playing regularly, dropping 5 shots off your handicap is a realistic one-season goal — roughly 6 to 9 months of tracked rounds and focused practice. Golfers with handicaps between 15 and 25 typically see the fastest improvement because there are more low-hanging strokes to save.",
        },
      },
      {
        "@type": "Question",
        name: "What is the fastest way to lower your golf handicap?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Track your stats (fairways, greens, putts, penalties), identify your two biggest leaks, and practice those specifically. Most amateurs waste range time on driver when their handicap is bleeding shots on wedges inside 100 yards and putts inside 6 feet.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need lessons to lower my handicap?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Lessons help — but only if you know what to work on. Track your stats for 5 to 10 rounds first so your instructor can focus on the parts of your game costing you the most strokes.",
        },
      },
    ],
  };

  return (
    <>
      <SEOHead
        title="How to Drop 5 Shots Off Your Handicap in One Season | MyBirdieBoard"
        description="A practical, data-driven guide to lowering your golf handicap by 5 shots in a single season. Learn which stats to track and where amateurs actually lose strokes."
        keywords="how to lower golf handicap, drop shots off handicap, improve golf handicap, lower handicap fast, golf improvement plan, handicap improvement tips"
      >
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">{JSON.stringify(faqData)}</script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://mybirdieboard.com/" },
              { "@type": "ListItem", position: 2, name: "Blog", item: "https://mybirdieboard.com/blog" },
              {
                "@type": "ListItem",
                position: 3,
                name: "How to Drop 5 Shots Off Your Handicap",
                item: "https://mybirdieboard.com/blog/how-to-drop-shots-off-handicap",
              },
            ],
          })}
        </script>
      </SEOHead>

      <div className="min-h-screen bg-background">
        <header className="bg-primary text-white py-12">
          <div className="container mx-auto px-4">
            <BreadcrumbNav />
            <div className="mt-4">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                How to Drop 5 Shots Off Your Handicap in One Season
              </h1>
              <p className="text-lg text-white/90">
                A data-driven, no-nonsense plan for real improvement — no swing overhaul required.
              </p>
            </div>
          </div>
        </header>

        <main className="container mx-auto py-12 px-4">
          <article className="max-w-3xl mx-auto prose prose-lg max-w-none space-y-8">
            <section>
              <p className="text-muted-foreground">
                Every amateur wants to lower their handicap. Almost none of them approach it like a project.
                They hit balls at the range, blame the driver, and hope the next round is better. This guide
                takes the opposite approach: use your own data to find the two or three places you're actually
                losing strokes, then attack them.
              </p>
              <p className="text-muted-foreground">
                If you're between a 15 and a 25 handicap, dropping 5 shots in one season is completely
                realistic. Here's the four-step plan.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <ClipboardList className="h-6 w-6 text-primary" /> Step 1 — Track every round for 30 days
              </h2>
              <p className="text-muted-foreground mb-4">
                You cannot fix what you cannot measure. Before changing anything about your practice, log at
                least 5–10 rounds with these six stats per round: fairways hit, greens in regulation, putts,
                up-and-down attempts, penalty strokes, and score vs par. Use{" "}
                <Link to="/" className="text-primary hover:underline">
                  MyBirdieBoard
                </Link>{" "}
                or a paper journal — the tool matters less than the consistency.
              </p>
              <p className="text-muted-foreground">
                See our full breakdown of <Link to="/blog/golf-stats-to-track" className="text-primary hover:underline">golf stats to track</Link>{" "}
                for definitions and why each one matters.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" /> Step 2 — Find your two biggest leaks
              </h2>
              <p className="text-muted-foreground mb-4">
                After 5–10 rounds, compare your averages to these benchmarks:
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="font-semibold mb-1">Fairways hit</p>
                    <p className="text-sm text-muted-foreground">Bogey golfer: 5–7 of 14. Below 4 = driving is a leak.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="font-semibold mb-1">Greens in regulation</p>
                    <p className="text-sm text-muted-foreground">Bogey golfer: 3–5. Below 3 = approach play or distance control.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="font-semibold mb-1">Putts per round</p>
                    <p className="text-sm text-muted-foreground">Solid: 32–34. Above 36 = putting is bleeding strokes.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="font-semibold mb-1">Penalty strokes</p>
                    <p className="text-sm text-muted-foreground">Target: 0–1 per round. 3+ = course management, not swing.</p>
                  </CardContent>
                </Card>
              </div>
              <p className="text-muted-foreground">
                Pick the two worst. Ignore the rest for the next 8 weeks.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" /> Step 3 — Practice with intent
              </h2>
              <p className="text-muted-foreground mb-4">
                80% of your practice time should attack your two biggest leaks. If putting is the leak, that's
                a putting mat at home five nights a week — not a bucket of drivers on Saturday. If penalties
                are the leak, that's a session on course management and shot selection, not more range balls.
              </p>
              <p className="text-muted-foreground">
                Amateurs waste enormous amounts of time practicing the wrong things because the range feels
                productive. Data cuts through that.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <TrendingDown className="h-6 w-6 text-primary" /> Step 4 — Recheck monthly, adjust quarterly
              </h2>
              <p className="text-muted-foreground mb-4">
                Every month, review your stats and confirm your two biggest leaks haven't shifted. Every three
                months, recompute your <Link to="/tools/handicap-calculator" className="text-primary hover:underline">handicap index</Link>{" "}
                using the WHS best-8-of-20 method and check the trend. If it's flat, your practice priorities
                are probably wrong — go back to step 2.
              </p>
              <p className="text-muted-foreground">
                For deeper technique, see <Link to="/guides/how-to-break-90-using-stats" className="text-primary hover:underline">how to break 90 using stats</Link>{" "}
                and <Link to="/guides/how-to-improve-at-golf-using-data" className="text-primary hover:underline">how to improve at golf using data</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">The realistic timeline</h2>
              <p className="text-muted-foreground mb-2">
                Assuming a starting handicap of 20 and consistent tracking:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Months 1–2:</strong> Baseline data collection. Handicap unchanged.</li>
                <li><strong>Months 3–5:</strong> First 2–3 shots come off from smarter course management alone.</li>
                <li><strong>Months 6–9:</strong> Practice on your leaks pays off. Another 2–3 shots.</li>
              </ul>
            </section>

            <BlogScoreTrackingCTA />
          </article>
        </main>
      </div>
    </>
  );
}
