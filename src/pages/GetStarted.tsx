import { useState } from "react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SignUpDialog } from "@/components/SignUpDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BarChart3,
  Target,
  Trophy,
  TrendingUp,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Star,
  ClipboardList,
  Zap,
  Users,
  Clock,
} from "lucide-react";

const GetStarted = () => {
  const [showSignup, setShowSignup] = useState(false);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Get Started with MyBirdieBoard — Golf Score Tracker",
    description:
      "Start tracking your golf scores, handicap, and performance analytics for free. No phone needed on the course.",
    url: "https://mybirdieboard.com/get-started",
    mainEntity: {
      "@type": "SoftwareApplication",
      name: "MyBirdieBoard",
      applicationCategory: "SportsApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "GBP",
        description: "Free tier with up to 4 rounds",
      },
    },
  };

  return (
    <>
      <SEOHead
        title="Get Started — Track Golf Scores & Improve | MyBirdieBoard"
        description="Start tracking your golf scores, handicap, and performance for free. Log rounds after you play. No phone distractions on the course."
        canonicalPath="/get-started"
        keywords="golf score tracker, track golf scores, golf handicap tracker, golf analytics, golf improvement"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <SiteHeader />

      <main className="min-h-screen">
        {/* ===== HERO SECTION ===== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-accent text-primary-foreground">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.15) 0%, transparent 50%)',
            }} />
          </div>
          <div className="relative max-w-5xl mx-auto px-4 py-16 sm:py-24 text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Trophy className="h-4 w-4" />
              Trusted by 1,000+ golfers
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight">
              Track Your Golf Scores.
              <br />
              <span className="text-secondary">See Real Improvement.</span>
            </h1>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-8 text-primary-foreground/90 leading-relaxed">
              Log your rounds after you play, track your handicap automatically, and
              discover exactly where to improve — all without touching your phone on
              the course.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setShowSignup(true)}
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 font-semibold shadow-lg"
              >
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/40 text-primary-foreground hover:bg-white/10 text-lg px-8 py-6"
              >
                <Link to="/demo">See Demo</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-primary-foreground/70">
              No credit card required · Free to start
            </p>
          </div>
        </section>

        {/* ===== PROBLEM SECTION ===== */}
        <section className="py-16 sm:py-20 bg-background">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-4">
              Tired of Forgetting Your Rounds?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Most golfers play a round, remember the score for a day, and then it's
              gone. Without tracking, you can't see patterns, measure progress, or
              know where to focus your practice.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: <Clock className="h-8 w-8 text-destructive" />,
                  title: "Scores fade fast",
                  desc: "After a few days, you can barely remember what you shot — let alone which holes hurt you.",
                },
                {
                  icon: <Smartphone className="h-8 w-8 text-destructive" />,
                  title: "Phone apps distract",
                  desc: "GPS apps and shot trackers slow your pace and pull you out of the game.",
                },
                {
                  icon: <TrendingUp className="h-8 w-8 text-destructive" />,
                  title: "No progress insight",
                  desc: "Without data, you're guessing where to improve instead of knowing.",
                },
              ].map((item, i) => (
                <Card key={i} className="p-6 text-left border-none shadow-md">
                  <div className="mb-3">{item.icon}</div>
                  <h3 className="font-semibold text-card-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="py-16 sm:py-20 bg-muted/40">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-2">
              How It Works
            </h2>
            <p className="text-muted-foreground mb-12 text-lg">
              Three simple steps to better golf
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  icon: <Target className="h-10 w-10 text-primary" />,
                  title: "Play Your Round",
                  desc: "Keep your phone in your pocket. Focus on the game. Use a paper scorecard or just remember your scores.",
                },
                {
                  step: "2",
                  icon: <ClipboardList className="h-10 w-10 text-primary" />,
                  title: "Log After You Play",
                  desc: "Enter your scores when you get home or at the 19th hole. Takes less than 2 minutes.",
                },
                {
                  step: "3",
                  icon: <BarChart3 className="h-10 w-10 text-primary" />,
                  title: "See Your Progress",
                  desc: "Watch your handicap trend, analyse your stats, and discover exactly where to improve.",
                },
              ].map((item, i) => (
                <div key={i} className="relative">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 sm:right-4 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-card-foreground text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FEATURES ===== */}
        <section className="py-16 sm:py-20 bg-background">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-2">
                Everything You Need to Improve
              </h2>
              <p className="text-muted-foreground text-lg">
                Powerful features, zero distractions
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <TrendingUp className="h-6 w-6" />,
                  title: "Handicap Tracking",
                  desc: "Your handicap index updates automatically after every round using WHS calculations.",
                },
                {
                  icon: <BarChart3 className="h-6 w-6" />,
                  title: "Performance Analytics",
                  desc: "Track putts, GIR, fairways hit, penalties, and Stableford points across every round.",
                },
                {
                  icon: <Trophy className="h-6 w-6" />,
                  title: "Course Leaderboards",
                  desc: "Compare your scores with other golfers on the same course. Friendly competition drives improvement.",
                },
                {
                  icon: <Target className="h-6 w-6" />,
                  title: "Score Progression",
                  desc: "Visualise how your scores trend over time with interactive charts and round-by-round history.",
                },
                {
                  icon: <Zap className="h-6 w-6" />,
                  title: "Stableford & Stroke",
                  desc: "Full support for both stroke play and Stableford scoring, with gross and net breakdowns.",
                },
                {
                  icon: <Users className="h-6 w-6" />,
                  title: "Multi-Course Support",
                  desc: "Track rounds at any course. Search from thousands of courses or add your own.",
                },
              ].map((feature, i) => (
                <Card key={i} className="p-5 hover:shadow-lg transition-shadow duration-300 border-border/60">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-3">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-card-foreground mb-1.5">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SOCIAL PROOF ===== */}
        <section className="py-16 sm:py-20 bg-muted/40">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-10">
              What Golfers Are Saying
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  name: "James R.",
                  quote: "Tracking my stats has helped me drop my handicap by 3 strokes in just a few months.",
                },
                {
                  name: "Sarah L.",
                  quote: "The Course Leaderboards are a game-changer! Even when my friends play on different days, we can still compete.",
                },
                {
                  name: "Mark T.",
                  quote: "Having a proper handicap without needing a club membership is awesome. MyBirdieBoard makes it super simple.",
                },
              ].map((review, i) => (
                <Card key={i} className="p-6 text-left">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic leading-relaxed">
                    "{review.quote}"
                  </p>
                  <p className="text-sm font-semibold text-card-foreground">{review.name}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FREE VS PRO ===== */}
        <section className="py-16 sm:py-20 bg-background">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-2">
                Start Free. Upgrade When You're Ready.
              </h2>
              <p className="text-muted-foreground text-lg">
                No pressure. See the value first.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Free tier */}
              <Card className="p-6 border-2 border-border">
                <h3 className="text-lg font-bold text-card-foreground mb-1">Free</h3>
                <p className="text-3xl font-bold text-card-foreground mb-4">
                  £0<span className="text-base font-normal text-muted-foreground">/month</span>
                </p>
                <ul className="space-y-3 mb-6">
                  {[
                   "Track up to 4 rounds",
                    "Score progression chart",
                    "Stableford scoring",
                    "Course search",
                    "Detailed stats (putts, GIR, fairways)",
                    "Course leaderboards",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowSignup(true)}
                >
                  Get Started Free
                </Button>
              </Card>

              {/* Pro tier */}
              <Card className="p-6 border-2 border-primary relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                  MOST POPULAR
                </div>
                <h3 className="text-lg font-bold text-card-foreground mb-1">Pro</h3>
                <p className="text-3xl font-bold text-card-foreground mb-4">
                  £2.99<span className="text-base font-normal text-muted-foreground">/month</span>
                </p>
                <ul className="space-y-3 mb-6">
                  {[
                   "Unlimited round tracking",
                    "Handicap calculation",
                    "Score milestones & achievements",
                    "Full round history",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" onClick={() => setShowSignup(true)}>
                  Start Free, Upgrade Anytime
                </Button>
              </Card>
            </div>
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className="py-16 sm:py-20 bg-gradient-to-br from-primary via-primary/95 to-accent text-primary-foreground">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">
              Ready to Take Your Game Seriously?
            </h2>
            <p className="text-lg text-primary-foreground/85 mb-8 max-w-xl mx-auto leading-relaxed">
              Join 1,000+ golfers who are tracking their scores, lowering their
              handicaps, and competing with friends — all without distractions on the
              course.
            </p>
            <Button
              size="lg"
              onClick={() => setShowSignup(true)}
              className="bg-white text-primary hover:bg-white/90 text-lg px-10 py-6 font-semibold shadow-lg"
            >
              Create Your Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="mt-4 text-sm text-primary-foreground/60">
              Free to start · No credit card required · Upgrade anytime
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />

      <SignUpDialog open={showSignup} onOpenChange={setShowSignup} />
    </>
  );
};

export default GetStarted;
