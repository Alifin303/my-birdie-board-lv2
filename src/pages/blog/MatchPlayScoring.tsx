import { useEffect } from "react";
import { BlogScoreTrackingCTA } from "@/components/BlogScoreTrackingCTA";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, CheckCircle, Flag, Target, HelpCircle } from "lucide-react";

export default function MatchPlayScoring() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "How to Keep Score in Match Play Golf: Complete Scoring Guide",
    "description": "Learn how to keep score in match play golf. Understand holes up/down, dormie, concessions, and all the rules you need to track match play rounds.",
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
    "datePublished": "2026-02-07",
    "dateModified": "2026-02-07",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://mybirdieboard.com/blog/match-play-scoring"
    }
  };

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does scoring work in match play golf?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "In match play, each hole is a separate contest. The player with the lowest score on a hole wins that hole. The match score is tracked as holes up or holes down, not total strokes."
        }
      },
      {
        "@type": "Question",
        "name": "What does 3 and 2 mean in match play?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A result of '3 and 2' means one player was 3 holes up with only 2 holes remaining, making it mathematically impossible for the trailing player to win. The match ends early."
        }
      },
      {
        "@type": "Question",
        "name": "What is dormie in match play?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Dormie means a player is up by exactly the number of holes remaining. For example, 3 up with 3 to play. The leading player cannot lose in regulation — they can only win or halve the match."
        }
      },
      {
        "@type": "Question",
        "name": "Can you concede a putt in match play?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, in match play you can concede your opponent's putt, hole, or even the entire match at any time. Concessions cannot be refused or withdrawn. This is one of the key differences from stroke play."
        }
      }
    ]
  };

  return (
    <>
      <SEOHead
        title="How to Keep Score in Match Play Golf | MyBirdieBoard"
        description="Learn how to keep score in match play golf. Understand holes up/down, dormie, concessions, handicap strokes, and all the rules for match play scoring."
        keywords="match play scoring, how to keep score match play, match play golf rules, match play vs stroke play, dormie, golf match play, concede putt match play"
        ogType="article"
        lastModified="2026-02-07T10:00:00Z"
      >
        <meta property="article:published_time" content="2026-02-07T10:00:00Z" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mybirdieboard.com/" },
              { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://mybirdieboard.com/blog" },
              { "@type": "ListItem", "position": 3, "name": "Match Play Scoring", "item": "https://mybirdieboard.com/blog/match-play-scoring" }
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
                How to Keep Score in Match Play Golf
              </h1>
              <p className="text-lg text-white/90 max-w-2xl">
                A complete guide to match play scoring, rules, terminology, and strategy
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm text-white/70">
                <span>February 7, 2026</span>
                <span>•</span>
                <span>10 min read</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto py-12 px-4">
          <article className="max-w-3xl mx-auto prose prose-lg">

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-foreground">What Is Match Play in Golf?</h2>
              <p className="text-muted-foreground mb-4">
                Match play is one of the oldest and most exciting formats in golf. Unlike <Link to="/blog/stableford-scoring" className="text-primary hover:underline">stroke play or Stableford</Link>, 
                where you count every shot over 18 holes, <strong>match play is a hole-by-hole competition</strong> between 
                two players (or two teams). Each hole is a separate contest — win it, lose it, or halve it.
              </p>
              <p className="text-muted-foreground mb-4">
                Match play is used in some of golf's biggest events, including the Ryder Cup, Presidents Cup, 
                WGC-Dell Technologies Match Play, and the U.S. Amateur Championship. It's also a popular format 
                for casual weekend matches and club competitions.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-foreground">How Match Play Scoring Works</h2>
              <p className="text-muted-foreground mb-4">
                The fundamental difference from stroke play is simple: <strong>you don't track total strokes</strong>. 
                Instead, you track how many holes you've won versus your opponent.
              </p>

              <div className="grid gap-4 my-6">
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Win a Hole</p>
                        <p className="text-muted-foreground text-sm">The player with the <strong>lowest score</strong> on a hole wins that hole and goes 1 up (or reduces their deficit by 1).</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Halve a Hole</p>
                        <p className="text-muted-foreground text-sm">If both players score the same, the hole is <strong>halved</strong> (tied). The match score stays the same.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Flag className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Lose a Hole</p>
                        <p className="text-muted-foreground text-sm">The player with the higher score loses the hole and goes 1 down (or their opponent goes 1 up).</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Reading a Match Play Scoreboard</h2>
              <p className="text-muted-foreground mb-4">
                Match play scores are expressed as holes up or down, not in total strokes. Here's how to read common match play scores:
              </p>

              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-3 text-left">Score</th>
                      <th className="border p-3 text-left">What It Means</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-3 font-semibold">All Square (AS)</td>
                      <td className="border p-3 text-muted-foreground">The match is tied — both players have won the same number of holes.</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-semibold">2 Up</td>
                      <td className="border p-3 text-muted-foreground">You've won 2 more holes than your opponent so far.</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-semibold">1 Down</td>
                      <td className="border p-3 text-muted-foreground">Your opponent has won 1 more hole than you.</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-semibold">3 & 2</td>
                      <td className="border p-3 text-muted-foreground">The match ended early — the winner was 3 up with only 2 holes left to play.</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-semibold">1 Up (after 18)</td>
                      <td className="border p-3 text-muted-foreground">The match went to the final hole and was won by 1 hole.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Match Play Scoring Example</h2>
              <p className="text-muted-foreground mb-4">
                Let's walk through the first 9 holes of a match between Player A and Player B:
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
                      <td className="border p-2 font-medium">Player A</td>
                      <td className="border p-2 text-center">4</td>
                      <td className="border p-2 text-center">3</td>
                      <td className="border p-2 text-center">6</td>
                      <td className="border p-2 text-center">4</td>
                      <td className="border p-2 text-center">3</td>
                      <td className="border p-2 text-center">4</td>
                      <td className="border p-2 text-center">5</td>
                      <td className="border p-2 text-center">5</td>
                      <td className="border p-2 text-center">4</td>
                    </tr>
                    <tr>
                      <td className="border p-2 font-medium">Player B</td>
                      <td className="border p-2 text-center">5</td>
                      <td className="border p-2 text-center">3</td>
                      <td className="border p-2 text-center">5</td>
                      <td className="border p-2 text-center">5</td>
                      <td className="border p-2 text-center">4</td>
                      <td className="border p-2 text-center">3</td>
                      <td className="border p-2 text-center">5</td>
                      <td className="border p-2 text-center">4</td>
                      <td className="border p-2 text-center">5</td>
                    </tr>
                    <tr className="bg-primary/10">
                      <td className="border p-2 font-medium">Result</td>
                      <td className="border p-2 text-center text-green-600 font-semibold">A</td>
                      <td className="border p-2 text-center">—</td>
                      <td className="border p-2 text-center text-red-600 font-semibold">B</td>
                      <td className="border p-2 text-center text-green-600 font-semibold">A</td>
                      <td className="border p-2 text-center text-green-600 font-semibold">A</td>
                      <td className="border p-2 text-center text-red-600 font-semibold">B</td>
                      <td className="border p-2 text-center">—</td>
                      <td className="border p-2 text-center text-red-600 font-semibold">B</td>
                      <td className="border p-2 text-center text-green-600 font-semibold">A</td>
                    </tr>
                    <tr className="bg-muted">
                      <td className="border p-2 font-medium">Match Status</td>
                      <td className="border p-2 text-center text-xs">1 Up A</td>
                      <td className="border p-2 text-center text-xs">1 Up A</td>
                      <td className="border p-2 text-center text-xs">AS</td>
                      <td className="border p-2 text-center text-xs">1 Up A</td>
                      <td className="border p-2 text-center text-xs">2 Up A</td>
                      <td className="border p-2 text-center text-xs">1 Up A</td>
                      <td className="border p-2 text-center text-xs">1 Up A</td>
                      <td className="border p-2 text-center text-xs">AS</td>
                      <td className="border p-2 text-center text-xs">1 Up A</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-muted-foreground">
                <strong>After 9 holes: Player A is 1 Up.</strong> Despite Player A shooting 38 and Player B shooting 39 — just one stroke difference — 
                the match swung back and forth. That's the beauty of match play.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-foreground">When Does a Match End?</h2>
              <p className="text-muted-foreground mb-4">
                Unlike stroke play, match play doesn't always go to 18 holes. A match ends when:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-3 mb-4">
                <li><strong>A player is more holes up than there are holes remaining.</strong> For example, if you're 4 up with 3 holes to play, the match is over — you win "4 & 3".</li>
                <li><strong>After 18 holes, one player is ahead.</strong> They win "1 up", "2 up", etc.</li>
                <li><strong>The match is all square after 18.</strong> The match is halved, or extra holes may be played in competition to determine a winner.</li>
                <li><strong>A player concedes the match.</strong> A player can concede at any time.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Key Match Play Terms</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Dormie</h4>
                    <p className="text-muted-foreground text-sm">
                      When a player is up by exactly the number of holes remaining. For example, 3 up with 3 to play. 
                      The leading player cannot lose in regulation — they can only win or halve the match.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Concession</h4>
                    <p className="text-muted-foreground text-sm">
                      In match play, you can concede (or "give") your opponent's next putt, the entire hole, or even the match. 
                      Once conceded, it can't be refused or withdrawn. This speeds up play — short putts are often conceded 
                      (the famous "gimme").
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">All Square (AS)</h4>
                    <p className="text-muted-foreground text-sm">
                      The match is tied. Both players have won the same number of holes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Press</h4>
                    <p className="text-muted-foreground text-sm">
                      A common side bet where the trailing player starts a new match within the existing match, 
                      typically when they're 2 down. It adds an extra layer of excitement to the round.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Handicaps in Match Play</h2>
              <p className="text-muted-foreground mb-4">
                When players of different abilities compete in match play, <Link to="/blog/understanding-golf-handicap-system" className="text-primary hover:underline">handicap strokes</Link> are used 
                to level the playing field:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-3 mb-4">
                <li><strong>Calculate the difference</strong> between both players' course handicaps. The lower handicap player plays off scratch (0), and the higher handicap player receives the difference in strokes.</li>
                <li><strong>Strokes are allocated by hole handicap (stroke index).</strong> If you receive 10 strokes, you get one stroke on the 10 hardest-rated holes on the course.</li>
                <li><strong>Net scores determine who wins each hole.</strong> After applying any handicap strokes, compare net scores to determine the hole winner.</li>
              </ul>
              <p className="text-muted-foreground">
                <strong>Example:</strong> Player A has a course handicap of 8, Player B has 20. Player B receives 12 strokes 
                (20 − 8 = 12), applied to the 12 hardest holes by stroke index. On those holes, Player B's score is reduced by 1 
                before comparing.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Match Play vs Stroke Play</h2>

              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-3 text-left">Feature</th>
                      <th className="border p-3 text-left">Match Play</th>
                      <th className="border p-3 text-left">Stroke Play</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-3 font-medium">Scoring unit</td>
                      <td className="border p-3 text-muted-foreground">Holes won</td>
                      <td className="border p-3 text-muted-foreground">Total strokes</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">Bad hole impact</td>
                      <td className="border p-3 text-muted-foreground">Lose just 1 hole</td>
                      <td className="border p-3 text-muted-foreground">Every stroke counts</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">Conceding putts</td>
                      <td className="border p-3 text-muted-foreground">Allowed</td>
                      <td className="border p-3 text-muted-foreground">Not allowed</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">Can end early?</td>
                      <td className="border p-3 text-muted-foreground">Yes — when result decided</td>
                      <td className="border p-3 text-muted-foreground">No — play all 18</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">Strategy</td>
                      <td className="border p-3 text-muted-foreground">More aggressive</td>
                      <td className="border p-3 text-muted-foreground">More conservative</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">Pick up allowed?</td>
                      <td className="border p-3 text-muted-foreground">Yes — concede the hole</td>
                      <td className="border p-3 text-muted-foreground">No — must hole out</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Match Play Strategy Tips</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Play the Player, Not the Course</h4>
                    <p className="text-muted-foreground text-sm">
                      In stroke play, you're trying to beat the course. In match play, you only need to beat your opponent on each hole. 
                      If they're in trouble, play safe. If they've hit the green, be more aggressive.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">A Bad Hole Only Costs One</h4>
                    <p className="text-muted-foreground text-sm">
                      Whether you make a triple bogey or a double bogey, you only lose one hole. This freedom allows you to 
                      take risks you wouldn't normally take in stroke play.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Apply Pressure on the Tee</h4>
                    <p className="text-muted-foreground text-sm">
                      Hitting the fairway puts enormous pressure on your opponent. If you're in the fairway and they're in the rough, 
                      you've already gained a psychological edge.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Manage Concessions Wisely</h4>
                    <p className="text-muted-foreground text-sm">
                      Conceding short putts early builds goodwill and speeds up play. But as the match tightens, 
                      making your opponent putt those 3-footers can apply real pressure.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Never Give Up</h4>
                    <p className="text-muted-foreground text-sm">
                      Some of the greatest match play comebacks have happened when players were 4 or 5 down. 
                      Unlike stroke play, the momentum can shift quickly — you only need to win more holes than you lose from that point.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Match Play Formats</h2>
              <p className="text-muted-foreground mb-4">
                Match play isn't just singles. Here are the most popular formats:
              </p>

              <div className="grid md:grid-cols-2 gap-6 my-6">
                <Card>
                  <CardContent className="p-6">
                    <Users className="h-8 w-8 text-primary mb-3" />
                    <h3 className="text-xl font-semibold mb-2">Singles</h3>
                    <p className="text-muted-foreground text-sm">
                      One player vs one player. The most common format, used in the knockout stages of the WGC Match Play.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <Users className="h-8 w-8 text-accent mb-3" />
                    <h3 className="text-xl font-semibold mb-2">Foursomes (Alternate Shot)</h3>
                    <p className="text-muted-foreground text-sm">
                      Two-person teams alternate hitting the same ball. Partners also alternate tee shots on odd and even holes.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <Users className="h-8 w-8 text-primary mb-3" />
                    <h3 className="text-xl font-semibold mb-2">Four-Ball (Better Ball)</h3>
                    <p className="text-muted-foreground text-sm">
                      Two-person teams where each player plays their own ball. The best score from each team counts on each hole.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <Trophy className="h-8 w-8 text-accent mb-3" />
                    <h3 className="text-xl font-semibold mb-2">Ryder Cup Format</h3>
                    <p className="text-muted-foreground text-sm">
                      Combines foursomes, four-ball, and singles sessions over three days. Each match earns a point for the winning team.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Frequently Asked Questions</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">What does "3 and 2" mean in match play?</h3>
                  <p className="text-muted-foreground">
                    It means one player was 3 holes up with only 2 holes remaining, making it mathematically impossible for the trailing player 
                    to win. The match ends early with a "3 & 2" result.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Can you concede a putt in match play?</h3>
                  <p className="text-muted-foreground">
                    Yes! Concessions are a unique feature of match play. You can concede your opponent's putt, the hole, or even the match at any time. 
                    Once conceded, it cannot be refused or withdrawn.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">What happens if the match is tied after 18 holes?</h3>
                  <p className="text-muted-foreground">
                    In a friendly match, it's typically declared a halve (tie). In competitions, extra holes are played in sudden death — 
                    the first player to win a hole wins the match.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Do penalty rules differ in match play?</h3>
                  <p className="text-muted-foreground">
                    The Rules of Golf are mostly the same, but there are specific match play rules. For instance, if you play out of turn, 
                    your opponent can ask you to replay the shot (no penalty). Also, <strong>loss of hole</strong> is the penalty rather than stroke penalties 
                    for certain infractions.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-accent/10 rounded-lg p-8 mb-10">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Track All Your Golf Rounds with MyBirdieBoard</h2>
              <p className="text-muted-foreground mb-6">
                Whether you play stroke play, <Link to="/blog/stableford-scoring" className="text-primary hover:underline">Stableford</Link>, or match play — tracking your scores helps you 
                identify strengths and weaknesses. MyBirdieBoard makes it easy to log your rounds, 
                <Link to="/guides/golf-handicap-calculator" className="text-primary hover:underline"> track your handicap</Link>, and analyse your performance over time.
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
                <Link to="/blog/stableford-scoring" className="text-primary hover:underline">
                  → What is Stableford Scoring?
                </Link>
                <Link to="/blog/understanding-golf-handicap-system" className="text-primary hover:underline">
                  → Understanding the Golf Handicap System
                </Link>
                <Link to="/blog/course-management-tips" className="text-primary hover:underline">
                  → Golf Course Management Tips
                </Link>
                <Link to="/blog/how-to-break-100" className="text-primary hover:underline">
                  → How to Break 100 in Golf
                </Link>
                <Link to="/guides/how-to-track-golf-scores" className="text-primary hover:underline">
                  → How to Track Golf Scores Effectively
                </Link>
              </div>
            </section>
            <BlogScoreTrackingCTA />
          </article>
        </main>
      </div>
    </>
  );
}
