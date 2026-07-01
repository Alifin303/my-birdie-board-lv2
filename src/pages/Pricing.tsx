import { useState } from "react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { SiteFooter } from "@/components/SiteFooter";
import { SignUpDialog } from "@/components/SignUpDialog";
import { LoginDialog } from "@/components/LoginDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, User } from "lucide-react";
import { Logo } from "@/components/Logo";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Pricing = () => {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const freeFeatures = [
    "Log unlimited rounds after you play",
    "Automatic handicap tracking (personal)",
    "Detailed stats: fairways, greens, putts",
    "Course leaderboards",
    "Round history & scorecards",
    "Access to all golf courses",
  ];

  const proFeatures = [
    "Everything in Free",
    "Official WHS handicap calculation",
    "Advanced performance analytics",
    "Score progression charts & trends",
    "Best-of-8 differential breakdown",
    "Priority support",
  ];

  const faqs = [
    {
      q: "Is MyBirdieBoard really free?",
      a: "Yes. The Free plan lets you log rounds, track your handicap, and view course leaderboards at no cost — no credit card required.",
    },
    {
      q: "What do I get by upgrading to Pro?",
      a: "Pro (£2.99/month) unlocks official WHS handicap calculation, advanced performance analytics, and progression charts to help you improve faster.",
    },
    {
      q: "Can I cancel any time?",
      a: "Absolutely. Pro is a rolling monthly subscription — cancel from your account settings and you'll keep access until the end of the billing period.",
    },
    {
      q: "Do I need to use my phone on the course?",
      a: "No. MyBirdieBoard is designed for post-round entry. Play distraction-free and log your scores afterwards.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major cards via Stripe. Payments are processed securely and we never store your card details.",
    },
  ];

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "MyBirdieBoard",
    description: "Golf score tracker with automatic handicap calculation and performance analytics.",
    brand: { "@type": "Brand", name: "MyBirdieBoard" },
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
        url: "https://mybirdieboard.com/pricing",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "2.99",
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
        url: "https://mybirdieboard.com/pricing",
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <SEOHead
        title="Pricing — Free & Pro Plans | MyBirdieBoard"
        description="Simple, honest golf score tracker pricing. Free forever plan for logging rounds and tracking your handicap. Pro at £2.99/month for WHS calculation and advanced analytics."
        canonicalPath="/pricing"
        keywords="mybirdieboard pricing, golf tracker pricing, golf app free vs paid, golf handicap app price"
      >
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </SEOHead>

      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b bg-background">
          <div className="container flex h-16 items-center justify-between">
            <Logo />
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link to="/blog" className="hidden sm:inline text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
              <Link to="/guides" className="hidden md:inline text-muted-foreground hover:text-foreground transition-colors">Guides</Link>
              <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Button variant="ghost" size="sm" onClick={() => setShowLogin(true)}>
                <User className="mr-1 h-4 w-4" /> Log In
              </Button>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          <section className="bg-primary text-primary-foreground py-12">
            <div className="container mx-auto px-4">
              <BreadcrumbNav />
              <div className="mt-6 text-center max-w-3xl mx-auto">
                <h1 className="text-4xl sm:text-5xl font-bold mb-4">Simple, honest pricing</h1>
                <p className="text-lg text-white/90">
                  Start tracking your rounds for free. Upgrade when you want official WHS handicap calculation and deeper analytics.
                </p>
              </div>
            </div>
          </section>

          <section className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="p-8 flex flex-col">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Free</h2>
                  <p className="text-muted-foreground">Everything you need to start tracking</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">£0</span>
                  <span className="text-muted-foreground">/forever</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {freeFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <X className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>Official WHS handicap calculation</span>
                  </li>
                </ul>
                <Button size="lg" variant="outline" onClick={() => setShowSignup(true)}>
                  Get started free
                </Button>
              </Card>

              <Card className="p-8 flex flex-col border-primary border-2 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Pro</h2>
                  <p className="text-muted-foreground">Serious about lowering your handicap</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">£2.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {proFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button size="lg" onClick={() => setShowSignup(true)}>
                  Start free — upgrade any time
                </Button>
              </Card>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8">
              Cancel any time. No credit card required for the Free plan.
            </p>
          </section>

          <section className="bg-muted/30 py-12">
            <div className="container mx-auto px-4 max-w-3xl">
              <h2 className="text-3xl font-bold text-center mb-8">Pricing FAQ</h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((f, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                    <AccordionContent>{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          <section className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to track your golf?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Join golfers using MyBirdieBoard to log rounds, calculate handicaps, and see real improvement over time.
            </p>
            <Button size="lg" onClick={() => setShowSignup(true)}>
              Create your free account
            </Button>
          </section>
        </main>

        <SiteFooter />
        <SignUpDialog open={showSignup} onOpenChange={setShowSignup} />
        <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
      </div>
    </>
  );
};

export default Pricing;
