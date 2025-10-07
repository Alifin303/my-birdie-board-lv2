
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LoginDialog } from "@/components/LoginDialog";
import { User, Clock, Tag } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const blogPosts = [
  {
    id: "golf-score-tracking-tips",
    title: "10 Essential Tips for Better Golf Score Tracking",
    description: "Master the art of golf score tracking with these proven techniques used by professional golfers and coaches.",
    excerpt: "Discover how proper golf score tracking can dramatically improve your game performance and help you identify areas for improvement.",
    date: "2024-12-09",
    readTime: "5 min read",
    tags: ["Golf Score Tracking", "Golf Tips", "Performance"],
    link: "/blog/golf-score-tracking-tips"
  },
  {
    id: "understanding-golf-handicap",
    title: "Understanding Your Golf Handicap: A Complete Guide",
    description: "Everything you need to know about golf handicaps, how they're calculated, and how to use them to improve your game.",
    excerpt: "Learn how golf handicaps work, why they matter, and how to use your handicap data to set realistic goals and track improvement.",
    date: "2024-12-08",
    readTime: "7 min read",
    tags: ["Golf Handicap", "Golf Analytics", "WHS"],
    link: "/blog/understanding-golf-handicap"
  },
  {
    id: "golf-analytics-explained",
    title: "Golf Analytics: The Future of Performance Improvement",
    description: "How data-driven golf analytics are revolutionizing the way golfers improve their game and track performance.",
    excerpt: "Explore the world of golf analytics and discover how professional golfers use data to gain competitive advantages.",
    date: "2024-12-07",
    readTime: "6 min read",
    tags: ["Golf Analytics", "Performance Tracking", "Technology"],
    link: "/blog/golf-analytics-explained"
  },
  {
    id: "course-leaderboards-strategy",
    title: "How to Dominate Course Leaderboards",
    description: "Strategic approaches to climbing course leaderboards and competing effectively against other golfers.",
    excerpt: "Learn the strategies top golfers use to consistently rank high on course leaderboards and compete at their best.",
    date: "2024-12-06",
    readTime: "8 min read",
    tags: ["Course Leaderboards", "Golf Strategy", "Competition"],
    link: "/blog/course-leaderboards-strategy"
  }
];

export default function Blog() {
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  return (
    <>
      <Helmet>
        <title>Golf Blog - Tips, Analytics & Performance Insights | MyBirdieBoard</title>
        <meta name="description" content="Expert golf tips, performance analytics insights, and score tracking strategies. Improve your golf game with data-driven advice from MyBirdieBoard's golf blog." />
        <meta name="keywords" content="golf blog, golf tips, golf analytics, golf performance, golf score tracking tips, golf handicap advice, course leaderboards strategy" />
        <link rel="canonical" href="https://mybirdieboard.com/blog" />
        
        {/* Open Graph meta tags */}
        <meta property="og:title" content="Golf Blog - Tips, Analytics & Performance Insights | MyBirdieBoard" />
        <meta property="og:description" content="Expert golf tips, performance analytics insights, and score tracking strategies to improve your golf game." />
        <meta property="og:url" content="https://mybirdieboard.com/blog" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://mybirdieboard.com/og-image.png" />
        <meta property="og:image:alt" content="MyBirdieBoard Golf Blog" />
        
        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Golf Blog - Expert Tips & Analytics Insights" />
        <meta name="twitter:description" content="Data-driven golf tips and performance insights to help you improve your game." />
        <meta name="twitter:image" content="https://mybirdieboard.com/og-image.png" />
        <meta name="twitter:image:alt" content="MyBirdieBoard Golf Blog" />
        
        {/* Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://mybirdieboard.com/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": "https://mybirdieboard.com/blog"
              }
            ]
          })}
        </script>
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "MyBirdieBoard Golf Blog",
            "description": "Expert golf tips, performance analytics insights, and score tracking strategies to improve your golf game.",
            "url": "https://mybirdieboard.com/blog",
            "publisher": {
              "@type": "Organization",
              "name": "MyBirdieBoard",
              "logo": {
                "@type": "ImageObject",
                "url": "https://mybirdieboard.com/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png"
              }
            },
            "blogPost": blogPosts.map(post => ({
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.description,
              "url": `https://mybirdieboard.com${post.link}`,
              "datePublished": post.date,
              "author": {
                "@type": "Organization",
                "name": "MyBirdieBoard"
              }
            }))
          })}
        </script>
      </Helmet>
      
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
