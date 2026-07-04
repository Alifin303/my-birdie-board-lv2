import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LoginDialog } from "@/components/LoginDialog";
import { User, ArrowLeft, MapPin, Globe2, Route, Trophy, CheckCircle } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { BlogScoreTrackingCTA } from "@/components/BlogScoreTrackingCTA";

export default function TrackGolfCoursesPlayed() {
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  return (
    <>
      <SEOHead
        title="Build Your Golf Bucket List: Track Every Course You've Ever Played"
        description="Turn every round into a pin on your personal golf map. Learn how to track the golf courses you've played, build a golf bucket list, and keep a lifelong record of your golf travels."
        keywords="golf courses played map, track golf courses played, golf bucket list, golf courses played tracker, golf travel log, courses played tracker, golf passport, golf map app"
        canonicalPath="/blog/track-golf-courses-played"
        ogType="article"
        lastModified="2026-07-04T10:00:00Z"
      >
        <meta property="article:published_time" content="2026-07-04T10:00:00Z" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mybirdieboard.com/" },
              { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://mybirdieboard.com/blog" },
              { "@type": "ListItem", "position": 3, "name": "Build Your Golf Bucket List", "item": "https://mybirdieboard.com/blog/track-golf-courses-played" }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Build Your Golf Bucket List: Track Every Course You've Ever Played",
            "image": "https://mybirdieboard.com/og-image.png",
            "url": "https://mybirdieboard.com/blog/track-golf-courses-played",
            "datePublished": "2026-07-04T10:00:00Z",
            "dateModified": "2026-07-04T10:00:00Z",
            "author": { "@type": "Organization", "name": "MyBirdieBoard" },
            "publisher": { "@type": "Organization", "name": "MyBirdieBoard", "logo": { "@type": "ImageObject", "url": "https://mybirdieboard.com/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png" } },
            "mainEntityOfPage": { "@type": "WebPage", "@id": "https://mybirdieboard.com/blog/track-golf-courses-played" }
          })}
        </script>
      </SEOHead>

      <div className="min-h-screen flex flex-col bg-background">
        <header className="w-full border-b bg-card/80 backdrop-blur sticky top-0 z-30">
          <div className="container mx-auto flex items-center justify-between py-3 px-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary">
              <img src="/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png" alt="MyBirdieBoard logo" className="w-7 h-7" />
              MyBirdieBoard
            </Link>
            <Button size="sm" variant="outline" onClick={() => setShowLoginDialog(true)}>
              <User className="w-4 h-4 mr-1" /> Log In
            </Button>
          </div>
        </header>

        <main className="flex-1">
          <article className="container mx-auto px-4 py-8 max-w-3xl">
            <BreadcrumbNav />

            <div className="mt-6 mb-8">
              <Link to="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Blog
              </Link>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                Build Your Golf Bucket List: Track Every Course You've Ever Played
              </h1>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 flex-wrap">
                <span>July 4, 2026</span>
                <span>·</span>
                <span>7 min read</span>
                <span>·</span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">Golf Travel</span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">Features</span>
              </div>
            </div>

            <div className="prose prose-lg max-w-none dark:prose-invert">
              <p className="lead">
                Ask any golfer how many courses they've played and you'll get a shrug and a rough guess. "Maybe 30? Could be 50 if you count the ones on holiday." Rounds get logged, scorecards get lost, and the story of where you've played quietly disappears.
              </p>
              <p>
                It shouldn't. The courses you've played are half of the story of your golf life — the trips, the buddies' trips, the muni you grew up on, the bucket-list course you finally ticked off. MyBirdieBoard now maps every one of them for you, automatically.
              </p>

              <h2>Why Tracking Courses Played Matters</h2>
              <p>
                Scorecards tell you <em>how</em> you played. A course map tells you <em>where</em> — and looking back, "where" is often the part you remember most clearly.
              </p>
              <ul>
                <li><strong>It's a golf memory bank.</strong> Ten years from now, you'll want to remember that windy round at Machrihanish, not just the 88 you shot.</li>
                <li><strong>It exposes patterns.</strong> Do you actually play variety, or is it 90% the same three courses? The map won't lie.</li>
                <li><strong>It turns golf trips into trophies.</strong> A row of new pins after a Scotland trip is its own kind of scorecard.</li>
                <li><strong>It gives you a bucket list with progress.</strong> The gaps on the map are as interesting as the pins.</li>
              </ul>

              <h2>How the Course Map Works in MyBirdieBoard</h2>
              <p>
                The map is baked into how you already use MyBirdieBoard — there's nothing extra to set up.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 not-prose">
                <div className="bg-card border rounded-lg p-5">
                  <MapPin className="w-6 h-6 text-primary mb-2" />
                  <p className="font-semibold text-foreground mb-1">1. Log a round</p>
                  <p className="text-sm text-muted-foreground">Add the course like normal — search, pick, enter your scores.</p>
                </div>
                <div className="bg-card border rounded-lg p-5">
                  <Globe2 className="w-6 h-6 text-primary mb-2" />
                  <p className="font-semibold text-foreground mb-1">2. We geocode it</p>
                  <p className="text-sm text-muted-foreground">Course coordinates are pulled and cached automatically.</p>
                </div>
                <div className="bg-card border rounded-lg p-5">
                  <Route className="w-6 h-6 text-primary mb-2" />
                  <p className="font-semibold text-foreground mb-1">3. Your map grows</p>
                  <p className="text-sm text-muted-foreground">A new pin appears — round count updates on courses you replay.</p>
                </div>
              </div>

              <p>
                You can{" "}
                <Link to="/demo" className="text-primary hover:underline">see it live in the demo dashboard</Link>{" "}
                — no signup required. Zoom into your home region, or zoom out to see the full picture.
              </p>

              <h2>Turning Your Map Into a Golf Bucket List</h2>
              <p>
                Once you can <em>see</em> where you've played, gaps start to feel like invitations. A few ideas to get more out of your map:
              </p>
              <ol>
                <li><strong>Set a "new course a month" goal.</strong> Twelve new pins a year adds up fast and keeps golf feeling fresh.</li>
                <li><strong>Plan a regional sweep.</strong> Pick a coastline or a county and tick off the courses one by one.</li>
                <li><strong>Compare with mates.</strong> Screenshot your maps side by side — instant golf conversation for the next round.</li>
                <li><strong>Chase your home-course count.</strong> Seeing "42 rounds" on your local pin makes it official: this is your course.</li>
                <li><strong>Save your golf trips.</strong> Every trip becomes a cluster of pins you can revisit forever.</li>
              </ol>

              <h2>A Map You Don't Have to Maintain</h2>
              <p>
                The point of MyBirdieBoard is that you never have to think about the tracking — you just play, log the round, and everything else builds itself: your handicap, your stats, your{" "}
                <Link to="/blog/course-leaderboards" className="text-primary hover:underline">course leaderboards</Link>, and now your map.
              </p>
              <p>
                No pins to drag, no trips to enter, no photo albums to organise. If you've logged the round, the course is on the map. That's it.
              </p>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 my-8 not-prose">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-foreground">The best time to start your golf map</h4>
                </div>
                <p className="text-muted-foreground mb-3">
                  Is the round you play next. Every course you log from here on out becomes a pin — and every pin becomes part of your golf story.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Available on the free plan</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Auto-updates with every round you log</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Works worldwide — home course or holiday round</li>
                </ul>
              </div>

              <h2>Related reading</h2>
              <ul>
                <li><Link to="/blog/course-leaderboards" className="text-primary hover:underline">Golf Course Leaderboards: Compete Without Playing Together</Link></li>
                <li><Link to="/blog/journal-18-meets-mybirdieboard" className="text-primary hover:underline">Journal 18 Meets MyBirdieBoard: The Perfect Golf Tracking System</Link></li>
                <li><Link to="/guides/digital-golf-journal" className="text-primary hover:underline">Guide: Keeping a Digital Golf Journal</Link></li>
              </ul>
            </div>

            <div className="mt-10">
              <BlogScoreTrackingCTA />
            </div>
          </article>
        </main>

        <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
      </div>
    </>
  );
}
