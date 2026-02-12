
import { useState } from "react";
import { BlogScoreTrackingCTA } from "@/components/BlogScoreTrackingCTA";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LoginDialog } from "@/components/LoginDialog";
import { User, ArrowLeft } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

export default function CourseLeaderboards() {
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  return (
    <>
      <SEOHead
        title="Golf Course Leaderboards: Compete With Friends Without Playing Together | MyBirdieBoard"
        description="Learn how MyBirdieBoard's course-by-course leaderboards let you compete with friends and other golfers at your local course — without needing to play at the same time."
        keywords="golf course leaderboard, compete with friends golf, golf leaderboard app, course leaderboard golf, golf competition app, asynchronous golf competition"
        ogType="article"
        lastModified="2026-02-12T10:00:00Z"
      >
        <meta property="article:published_time" content="2026-02-12T10:00:00Z" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mybirdieboard.com/" },
              { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://mybirdieboard.com/blog" },
              { "@type": "ListItem", "position": 3, "name": "Golf Course Leaderboards", "item": "https://mybirdieboard.com/blog/course-leaderboards" }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Golf Course Leaderboards: Compete With Friends Without Playing Together",
            "image": "https://mybirdieboard.com/og-image.png",
            "url": "https://mybirdieboard.com/blog/course-leaderboards",
            "datePublished": "2026-02-12T10:00:00Z",
            "dateModified": "2026-02-12T10:00:00Z",
            "author": { "@type": "Organization", "name": "MyBirdieBoard" },
            "publisher": { "@type": "Organization", "name": "MyBirdieBoard", "logo": { "@type": "ImageObject", "url": "https://mybirdieboard.com/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png" } },
            "mainEntityOfPage": { "@type": "WebPage", "@id": "https://mybirdieboard.com/blog/course-leaderboards" }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "How do golf course leaderboards work on MyBirdieBoard?", "acceptedAnswer": { "@type": "Answer", "text": "Every time you log a round at a course on MyBirdieBoard, your score is automatically added to that course's leaderboard. You can see how your best round compares to every other golfer who has played and logged a round there — no need to be in the same group or even play on the same day." } },
              { "@type": "Question", "name": "Do I need to play at the same time as my friends to compete?", "acceptedAnswer": { "@type": "Answer", "text": "No. MyBirdieBoard leaderboards are asynchronous. You and your friends can play the same course on completely different days and still compete on the same leaderboard. Just log your round after you play and your score appears automatically." } },
              { "@type": "Question", "name": "Are course leaderboards available on the free plan?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Course leaderboards are visible to all MyBirdieBoard users. You can browse any course page to see the leaderboard, view top scores, and see where you rank among other golfers." } }
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
              <h1 className="text-3xl md:text-4xl font-bold">Golf Course Leaderboards: Compete With Friends Without Playing Together</h1>
              <p className="text-lg mt-2 text-white/90">How MyBirdieBoard's course-by-course leaderboards add friendly competition to every round</p>
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
              <p className="text-muted-foreground">Published on February 12, 2026 • 8 min read</p>
            </div>

            <p className="text-xl text-muted-foreground mb-8">
              Golf is one of the few sports where you don't need to be on the course at the same time as your competitors. MyBirdieBoard takes advantage of this with course-by-course leaderboards that let you compete with friends, clubmates, and other golfers — even if you never tee off together.
            </p>

            <h2>Why Course Leaderboards Matter</h2>
            <p>
              Most golfers have a home course or a handful of courses they play regularly. You know the layout, you have your favourite holes, and you've built up a history there. But how does your best round at that course compare to other golfers who play it?
            </p>
            <p>
              That's what course leaderboards answer. Instead of comparing scores across different courses with different difficulties, MyBirdieBoard creates a dedicated leaderboard for every course in the system. Your score is compared against other golfers who have played the same holes, the same layout, and faced the same challenges.
            </p>

            <h2>How MyBirdieBoard Course Leaderboards Work</h2>
            <p>
              The concept is simple: every time you log a round using our <Link to="/" className="text-primary hover:underline">golf score tracker</Link>, your score is automatically placed on that course's leaderboard. Here's what happens behind the scenes:
            </p>
            <ol>
              <li><strong>Play your round</strong> — enjoy the game without distractions, no phone required on the course</li>
              <li><strong>Log your score after the round</strong> — enter your hole-by-hole scores in MyBirdieBoard when you're ready</li>
              <li><strong>Your score appears on the course leaderboard</strong> — instantly see where you rank among all golfers who have played that course</li>
              <li><strong>Compare and compete</strong> — check how your round stacks up against friends, regulars, and visitors</li>
            </ol>
            <p>
              There's no need to organise a competition, set up a group, or coordinate tee times. The leaderboard builds itself naturally as golfers log their rounds.
            </p>

            <h2>Competing Without Playing Together</h2>
            <p>
              This is the feature that makes MyBirdieBoard leaderboards different from traditional golf competitions. In a normal competition, everyone has to play on the same day, often at the same time. That means coordinating schedules, booking tee times together, and hoping the weather cooperates.
            </p>
            <p>
              With MyBirdieBoard's asynchronous leaderboards, none of that matters. Your mate can play on Saturday morning. You can play on Tuesday evening. Your scores still appear on the same leaderboard for that course, and you can see exactly who played better.
            </p>
            <p>
              This is particularly useful for:
            </p>
            <ul>
              <li><strong>Work friends</strong> who can't always get the same day off</li>
              <li><strong>Club members</strong> who play at different times throughout the week</li>
              <li><strong>Golf groups</strong> spread across different schedules</li>
              <li><strong>Friendly rivalries</strong> where you want to keep an ongoing competition going all season</li>
            </ul>

            <h2>What You Can See on a Course Leaderboard</h2>
            <p>
              Each course page on MyBirdieBoard includes a leaderboard showing:
            </p>
            <ul>
              <li><strong>Best gross scores</strong> — the lowest total scores posted at that course</li>
              <li><strong>Player rankings</strong> — where each golfer sits relative to others</li>
              <li><strong>Your personal best</strong> — your own top score highlighted so you can track improvement</li>
              <li><strong>Course statistics</strong> — average scores, scoring distribution, and course difficulty trends</li>
            </ul>
            <p>
              You can browse any course's leaderboard by visiting the <Link to="/courses" className="text-primary hover:underline">courses directory</Link> and selecting a course. Even if you haven't played there yet, you can see what scores others are posting and set a target for your first visit.
            </p>

            <h2>Using Leaderboards to Improve Your Game</h2>
            <p>
              Leaderboards aren't just about bragging rights — they're a powerful motivational tool. Here's how golfers use them to get better:
            </p>
            <ul>
              <li><strong>Set realistic targets</strong> — seeing what scores are achievable at your course helps you set meaningful goals</li>
              <li><strong>Track improvement over time</strong> — as you log more rounds, you can watch your position climb the leaderboard</li>
              <li><strong>Identify what's possible</strong> — knowing the best scores at your course gives you something concrete to aim for</li>
              <li><strong>Stay motivated between rounds</strong> — friendly competition keeps you engaged even when you can't get out on the course</li>
            </ul>
            <p>
              Combine leaderboard tracking with detailed <Link to="/guides/golf-performance-analytics" className="text-primary hover:underline">golf performance analytics</Link> to understand not just where you rank, but why — and what specific areas of your game to work on to climb higher.
            </p>

            <h2>Course Leaderboards vs. Traditional Competitions</h2>
            <p>
              Traditional golf competitions have their place, but course leaderboards solve several pain points:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-3 border-b font-semibold"></th>
                    <th className="text-left p-3 border-b font-semibold">Traditional Competition</th>
                    <th className="text-left p-3 border-b font-semibold">MyBirdieBoard Leaderboard</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border-b font-medium">Schedule</td>
                    <td className="p-3 border-b">Everyone plays same day</td>
                    <td className="p-3 border-b">Play whenever you want</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b font-medium">Setup</td>
                    <td className="p-3 border-b">Requires organiser</td>
                    <td className="p-3 border-b">Automatic — just log your round</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b font-medium">Duration</td>
                    <td className="p-3 border-b">Single event</td>
                    <td className="p-3 border-b">Ongoing, all season</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b font-medium">Participants</td>
                    <td className="p-3 border-b">Limited to entrants</td>
                    <td className="p-3 border-b">Anyone who plays the course</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b font-medium">Cost</td>
                    <td className="p-3 border-b">Entry fees common</td>
                    <td className="p-3 border-b">Free on MyBirdieBoard</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>Getting Started With Course Leaderboards</h2>
            <p>
              Getting onto a course leaderboard takes less than two minutes:
            </p>
            <ol>
              <li><Link to="/" className="text-primary hover:underline">Sign up for a free MyBirdieBoard account</Link></li>
              <li>Add your first round by searching for the course you played</li>
              <li>Enter your hole-by-hole scores</li>
              <li>Visit the course page to see your position on the leaderboard</li>
            </ol>
            <p>
              The more rounds you log, the more meaningful the leaderboards become. And the more golfers at your course who use MyBirdieBoard, the more competitive — and fun — the leaderboard gets. Share it with your playing partners and golf group to build out your course's leaderboard.
            </p>

            <h2>Frequently Asked Questions</h2>

            <h3>How do golf course leaderboards work on MyBirdieBoard?</h3>
            <p>
              Every time you log a round at a course on MyBirdieBoard, your score is automatically added to that course's leaderboard. You can see how your best round compares to every other golfer who has played and logged a round there — no need to be in the same group or even play on the same day.
            </p>

            <h3>Do I need to play at the same time as my friends to compete?</h3>
            <p>
              No. MyBirdieBoard leaderboards are asynchronous. You and your friends can play the same course on completely different days and still compete on the same leaderboard. Just log your round after you play and your score appears automatically.
            </p>

            <h3>Are course leaderboards available on the free plan?</h3>
            <p>
              Yes. Course leaderboards are visible to all MyBirdieBoard users. You can browse any course page to see the leaderboard, view top scores, and see where you rank among other golfers.
            </p>

            <div className="bg-accent/10 rounded-lg p-8 mt-12">
              <h3>Ready to Compete?</h3>
              <p className="mb-4">Start logging your rounds and see where you rank on your course's leaderboard. It's free to get started.</p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Related Resources:</h4>
                  <ul className="space-y-1 text-sm">
                    <li><Link to="/guides/golf-performance-analytics" className="text-primary hover:underline">Golf Performance Analytics Guide</Link></li>
                    <li><Link to="/guides/golf-statistics-tracker" className="text-primary hover:underline">Golf Statistics Tracker Guide</Link></li>
                    <li><Link to="/blog/golf-score-tracking-tips" className="text-primary hover:underline">10 Essential Golf Score Tracking Tips</Link></li>
                    <li><Link to="/courses" className="text-primary hover:underline">Browse Course Leaderboards</Link></li>
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
