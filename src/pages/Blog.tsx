
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LoginDialog } from "@/components/LoginDialog";
import { User, Clock, Tag } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const blogPosts = [
  {
    id: "golf-scoring-terms",
    title: "Golf Scoring Terms Explained: Birdie, Bogey, Eagle & More",
    description: "Learn every golf scoring term from birdie and bogey to eagle, albatross, and double bogey. A simple guide to golf scorecard terminology for beginners.",
    excerpt: "If you're new to golf — or just want to finally understand what 'albatross' means — this guide covers every scoring term you'll hear on the course, from the common to the extremely rare.",
    date: "2026-02-18",
    readTime: "9 min read",
    tags: ["Scoring", "Beginner", "Terminology"],
    link: "/blog/golf-scoring-terms"
  },
  {
    id: "course-leaderboards",
    title: "Golf Course Leaderboards: Compete Without Playing Together",
    description: "Learn how MyBirdieBoard's course-by-course leaderboards let you compete with friends and other golfers — without needing to play at the same time.",
    excerpt: "Golf is one of the few sports where you don't need to be on the course at the same time as your competitors. MyBirdieBoard's course leaderboards make friendly competition effortless.",
    date: "2026-02-12",
    readTime: "8 min read",
    tags: ["Leaderboards", "Competition", "Features"],
    link: "/blog/course-leaderboards"
  },
  {
    id: "playing-without-phone",
    title: "Why Playing Golf Without Your Phone Improves Focus and Enjoyment",
    description: "Discover why playing golf without your phone improves focus, enjoyment, and performance — and how to track your rounds after the game.",
    excerpt: "Technology has made golf smarter, but it's also made it noisier. Many golfers find they score better when they stop trying to track everything in real time.",
    date: "2026-02-07",
    readTime: "8 min read",
    tags: ["Mental Game", "Focus", "Post-Round Tracking"],
    link: "/blog/playing-without-phone"
  },
  {
    id: "putts-per-round",
    title: "How Many Putts Per Round is Good?",
    description: "Find out how many putts per round is good for your skill level. Putting averages by handicap, PGA Tour benchmarks, and tips to lower your putts per round.",
    excerpt: "Putting accounts for 40% of your strokes. Learn what a good number of putts per round looks like for your handicap level, and how to improve your putting stats.",
    date: "2026-02-07",
    readTime: "9 min read",
    tags: ["Putting", "Statistics", "Improvement"],
    link: "/blog/putts-per-round"
  },
  {
    id: "how-to-calculate-golf-handicap",
    title: "How to Calculate Golf Handicap: A Beginner's Guide",
    description: "Learn how to calculate your golf handicap step by step. A simple beginner-friendly guide to the World Handicap System, score differentials, and handicap index.",
    excerpt: "The handicap system can seem confusing, but the core concept is straightforward. Learn the step-by-step calculation with examples any beginner can follow.",
    date: "2026-02-07",
    readTime: "10 min read",
    tags: ["Handicap", "Beginner", "Education"],
    link: "/blog/how-to-calculate-golf-handicap"
  },
  {
    id: "golf-stats-to-track",
    title: "Golf Stats You Should Track to Improve",
    description: "Discover the most important golf statistics to track. From fairways hit to putts per round, learn which stats reveal where you're losing strokes.",
    excerpt: "Most golfers know their handicap but few track the stats that explain why they shoot what they shoot. These 6 essential stats cover every part of your game.",
    date: "2026-02-07",
    readTime: "11 min read",
    tags: ["Statistics", "Analytics", "Improvement"],
    link: "/blog/golf-stats-to-track"
  },
  {
    id: "match-play-scoring",
    title: "How to Keep Score in Match Play Golf",
    description: "Learn how to keep score in match play golf. Understand holes up/down, dormie, concessions, handicap strokes, and all the rules for match play scoring.",
    excerpt: "Match play is a hole-by-hole battle where you track holes won, not total strokes. Learn the scoring system, key terminology like dormie and concessions, and strategy tips.",
    date: "2026-02-07",
    readTime: "10 min read",
    tags: ["Match Play", "Scoring", "Rules"],
    link: "/blog/match-play-scoring"
  },
  {
    id: "how-to-break-100",
    title: "How to Break 100 in Golf: 15 Proven Tips",
    description: "Learn how to break 100 in golf with these 15 proven tips. From course management to avoiding big numbers, discover strategies that will help you shoot in the 90s.",
    excerpt: "Breaking 100 is a major milestone. Learn the strategies that separate the top 30% of golfers from the rest, including avoiding big numbers and smart course management.",
    date: "2026-01-04",
    readTime: "12 min read",
    tags: ["Beginner", "Scoring", "Strategy"],
    link: "/blog/how-to-break-100"
  },
  {
    id: "stableford-scoring",
    title: "What is Stableford Scoring in Golf?",
    description: "Complete guide to Stableford scoring - learn how points are calculated, the difference between gross and net Stableford, and why it's a popular alternative to stroke play.",
    excerpt: "Stableford is a points-based scoring system that rewards good holes and minimizes the impact of bad ones. Learn how to calculate Stableford points and track your scores.",
    date: "2025-01-25",
    readTime: "10 min read",
    tags: ["Stableford", "Scoring", "Rules"],
    link: "/blog/stableford-scoring"
  },
  {
    id: "golf-score-tracking-tips",
    title: "How to Track Golf Scores Effectively",
    description: "Master the art of golf score tracking with our comprehensive guide. Learn proven strategies to track scores, analyze performance, and improve your game with data-driven insights.",
    excerpt: "Discover how effective score tracking can transform your golf game. From choosing the right tracking method to analyzing your performance data, we'll show you everything you need to know.",
    date: "2025-01-20",
    readTime: "8 min read",
    tags: ["Score Tracking", "Analytics", "Improvement"],
    link: "/blog/golf-score-tracking-tips"
  },
  {
    id: "best-golf-clubs-for-beginners",
    title: "Best Golf Clubs for Beginners 2025",
    description: "Complete buying guide for beginner golf clubs. Expert recommendations on drivers, irons, putters, and complete sets to start your golf journey right.",
    excerpt: "Starting golf? Learn which clubs are best for beginners, what to look for, and top recommendations for complete sets and individual clubs.",
    date: "2025-01-20",
    readTime: "8 min read",
    tags: ["Equipment", "Beginners", "Buying Guide"],
    link: "/blog/best-golf-clubs-for-beginners"
  },
  {
    id: "improve-your-golf-swing",
    title: "How to Improve Your Golf Swing",
    description: "10 proven tips to master your golf swing. Learn proper grip, stance, rotation, and follow-through to lower your scores consistently.",
    excerpt: "Transform your golf swing with these expert techniques. From fundamentals to advanced tips, discover what it takes to build a consistent, powerful swing.",
    date: "2025-01-20",
    readTime: "10 min read",
    tags: ["Technique", "Instruction", "Improvement"],
    link: "/blog/improve-your-golf-swing"
  },
  {
    id: "course-management-tips",
    title: "Golf Course Management Tips",
    description: "Strategic tips to make smarter decisions on the course. Learn when to be aggressive, how to avoid big numbers, and lower your scores through better course management.",
    excerpt: "Good course management can save you 5-10 strokes per round. Learn the strategic decisions that separate smart golfers from the rest.",
    date: "2025-01-20",
    readTime: "9 min read",
    tags: ["Strategy", "Course Management", "Tips"],
    link: "/blog/course-management-tips"
  },
  {
    id: "understanding-golf-handicap-system",
    title: "Understanding the Golf Handicap System",
    description: "Complete guide to the World Handicap System. Learn how handicaps are calculated, what they mean, and how to establish and improve yours.",
    excerpt: "Everything you need to know about golf handicaps, from the basics of the WHS to advanced concepts like slope rating and course handicap.",
    date: "2025-01-20",
    readTime: "12 min read",
    tags: ["Handicap", "Rules", "Education"],
    link: "/blog/understanding-golf-handicap-system"
  }
];

export default function Blog() {
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  return (
    <>
      <SEOHead
        title="Golf Blog - Tips, Analytics & Performance Insights | MyBirdieBoard"
        description="Expert golf tips, performance analytics insights, and score tracking strategies. Improve your golf game with data-driven advice from MyBirdieBoard's golf blog."
        keywords="golf blog, golf tips, golf analytics, golf performance, golf score tracking tips, golf handicap advice, course leaderboards strategy"
      >
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://mybirdieboard.com/" },
              { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://mybirdieboard.com/blog" }
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "MyBirdieBoard Golf Blog",
            "url": "https://mybirdieboard.com/blog",
            "publisher": { "@type": "Organization", "name": "MyBirdieBoard", "logo": { "@type": "ImageObject", "url": "https://mybirdieboard.com/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png" } },
            "blogPost": blogPosts.map(post => ({
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.description,
              "url": `https://mybirdieboard.com${post.link}`,
              "datePublished": post.date,
              "author": { "@type": "Organization", "name": "MyBirdieBoard" }
            }))
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
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Golf Blog</h1>
              <p className="text-lg text-white/90">Expert tips, analytics insights, and strategies to improve your golf game</p>
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
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-8">
              {blogPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {post.readTime}
                      </div>
                      <span>{post.date}</span>
                    </div>
                    <CardTitle className="text-2xl hover:text-primary transition-colors">
                      <Link to={post.link}>{post.title}</Link>
                    </CardTitle>
                    <CardDescription className="text-base">{post.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <span key={tag} className="text-xs bg-secondary px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Link to={post.link}>
                        <Button variant="outline" size="sm">
                          Read More
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Internal linking section */}
            <div className="mt-16 bg-accent/10 rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-6">Explore More Golf Resources</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Golf Guides</h3>
                  <ul className="space-y-2 text-sm">
                    <li><Link to="/guides/how-to-track-golf-scores" className="text-primary hover:underline">How to Track Golf Scores</Link></li>
                    <li><Link to="/guides/golf-handicap-calculator" className="text-primary hover:underline">Golf Handicap Calculator Guide</Link></li>
                    <li><Link to="/guides/best-golf-score-tracking-apps" className="text-primary hover:underline">Best Golf Score Apps</Link></li>
                    <li><Link to="/guides/golf-performance-analytics" className="text-primary hover:underline">Golf Performance Analytics</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Get Started</h3>
                  <ul className="space-y-2 text-sm">
                    <li><Link to="/about" className="text-primary hover:underline">About MyBirdieBoard</Link></li>
                    <li><Link to="/faq" className="text-primary hover:underline">Frequently Asked Questions</Link></li>
                    <li><Link to="/courses" className="text-primary hover:underline">Find Golf Courses</Link></li>
                    <li><Link to="/" className="text-primary hover:underline">Start Tracking Your Scores</Link></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <div className="bg-primary/10 rounded-lg p-8">
                <h3 className="text-2xl font-semibold mb-4">Ready to Track Your Golf Performance?</h3>
                <p className="text-muted-foreground mb-6">Join thousands of golfers improving their game with MyBirdieBoard</p>
                <Link to="/">
                  <Button size="lg" className="bg-accent hover:bg-accent/90">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
        
        <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
      </div>
    </>
  );
}
