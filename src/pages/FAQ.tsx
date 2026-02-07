
import React, { useEffect } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqItems = [{
  id: "item-1",
  question: "What is MyBirdieBoard?",
  answer: "MyBirdieBoard is your personal golf score tracker. It lets you log every round you play, view your score history at each course, and compare your performance against other golfers on course leaderboards. It's the perfect tool to track your progress and aim for lower scores!"
}, {
  id: "item-2",
  question: "How does the course leaderboard work?",
  answer: "The course leaderboards show how your scores compare to other golfers at the same course. You can filter the leaderboards by date (monthly, yearly, or all-time) and choose to display either gross or net scores. Your best round's position is highlighted so you always know where you stand!"
}, {
  id: "item-3",
  question: "Can I track my past rounds?",
  answer: "Yes! MyBirdieBoard allows you to store and review all your previous rounds. Whether you played the course last week or last year, you'll have a full record of your scores, helping you see your progress over time."
}, {
  id: "item-4",
  question: "Does MyBirdieBoard track my handicap?",
  answer: "Yes! MyBirdieBoard calculates your handicap using official methods. However, please note that while this gives you a clear and accurate reflection of your playing ability, some golf clubs may not recognize it as an official club handicap."
}, {
  id: "item-5",
  question: "How much does MyBirdieBoard cost?",
  answer: "MyBirdieBoard offers a free tier that lets you track up to 4 rounds — perfect for trying out the app. For unlimited rounds and full access to all features, the Pro plan costs just £2.99 per month (cancel anytime). The price is shown in GBP but will be converted to your local currency at checkout. Plus, Pro subscribers get a 30-day free trial — cancel before the trial ends if it's not for you, and you won't be charged."
}, {
  id: "item-6",
  question: "Why should I use MyBirdieBoard instead of a notebook or spreadsheet?",
  answer: "With MyBirdieBoard, your scores are stored safely online and accessible from any device. Plus, you get dynamic leaderboards, round comparisons, and visual progress tracking — something a notebook just can't do!"
}, {
  id: "item-7",
  question: "Is MyBirdieBoard only available in certain countries?",
  answer: "Not at all! MyBirdieBoard has a database of over 30,000 golf courses worldwide. Plus, if a course isn't already listed, you can easily add it yourself. So no matter where you are or where you travel to play golf, MyBirdieBoard is ready to track your rounds and keep you connected to your game."
}, {
  id: "item-8",
  question: "How do I subscribe?",
  answer: "It's simple! Click the Get Started button on the homepage of our website, create your account, and you'll be on your way to better tracking and better scores in no time."
}, {
  id: "item-9",
  question: "Can I cancel my subscription?",
  answer: "Yes! You can cancel anytime. If you cancel mid-billing cycle, you'll still have access until your next billing date."
}, {
  id: "item-10",
  question: "How do I add a new golf course that isn't listed?",
  answer: "If you don't find your course in our database, you can easily add it by navigating to 'Add Round' and selecting 'Add New Course'. You'll need to provide the course name, location, and hole information including par and distances."
}, {
  id: "item-11",
  question: "Does MyBirdieBoard support Stableford scoring?",
  answer: "Yes! MyBirdieBoard automatically calculates both gross and net Stableford scores for every round you track. When you enter your hole-by-hole scores, we calculate your Stableford points based on your score relative to par on each hole. Net Stableford takes your handicap into account, distributing strokes across holes based on the stroke index. You can view your Stableford scores in your round history and dashboard."
}];

export default function FAQ() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  const generateFAQStructuredData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqItems.map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    };
  };

  return (
    <>
      <SEOHead
        title="Golf Score Tracking FAQ | MyBirdieBoard"
        description="Answers to common golf tracking questions. Learn about handicaps, Stableford scoring, subscriptions, and how to add courses."
        keywords="how to calculate golf handicap step by step, best golf score tracking app for beginners, golf score tracking FAQ, golf analytics questions, golf handicap calculator help, golf statistics tracker guide, course leaderboards FAQ"
      >
        {/* Enhanced FAQ Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify(generateFAQStructuredData())}
        </script>

        {/* Additional Breadcrumb Schema */}
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
                "name": "FAQ",
                "item": "https://mybirdieboard.com/faq"
              }
            ]
          })}
        </script>
      </SEOHead>
      
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Golf Score Tracking FAQ - How to Calculate Golf Handicap Step by Step</h1>
            <p className="text-lg max-w-2xl mx-auto text-center">
              Got questions about golf score tracking, handicap calculation, or performance analytics? We've got answers.
              Learn how MyBirdieBoard — the best golf score tracking app for beginners and pros — helps you track performance, 
              calculate handicaps step by step, and understand your game better.
            </p>
          </div>
        </header>
        
        <main className="container mx-auto py-12 px-4">
          <div className="max-w-3xl mx-auto">
            {/* Enhanced intro section with internal links */}
            <section className="mb-10 prose max-w-none">
              <h2 className="sr-only">About MyBirdieBoard Golf Score Tracker</h2>
              <p className="text-lg text-muted-foreground text-center mb-6">
                MyBirdieBoard is your digital golf journal — built for golfers who want more than just a score.
                Track your rounds, stats, and story in one place. With features like detailed round history, course leaderboards, 
                <Link to="/guides/golf-handicap-calculator" className="text-primary hover:underline mx-1">
                  handicap tracking
                </Link>, 
                and post-round performance insights, MyBirdieBoard helps you reflect, improve, and celebrate your journey — no matter your skill level.
              </p>
              <p className="text-center text-muted-foreground mb-6">
                Learn more about 
                <Link to="/guides/how-to-track-golf-scores" className="text-primary hover:underline mx-1">
                  how to track golf scores effectively
                </Link>
                or explore our 
                <Link to="/guides/golf-performance-analytics" className="text-primary hover:underline mx-1">
                  golf performance analytics guide
                </Link>.
                Start free with 4 rounds, or upgrade to Pro for unlimited rounds at just £2.99/month.
              </p>
            </section>
            
            <section itemScope itemType="https://schema.org/FAQPage">
              <Accordion type="single" collapsible className="mb-12">
                {faqItems.map(item => 
                  <AccordionItem 
                    key={item.id} 
                    value={item.id} 
                    itemScope 
                    itemProp="mainEntity" 
                    itemType="https://schema.org/Question"
                  >
                    <AccordionTrigger className="text-lg font-medium text-left" itemProp="name">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent 
                      itemScope 
                      itemProp="acceptedAnswer" 
                      itemType="https://schema.org/Answer"
                    >
                      <div className="text-muted-foreground" itemProp="text">
                        {item.answer}
                        {item.id === "item-4" && (
                          <p className="mt-2">
                            <Link to="/guides/golf-handicap-calculator" className="text-primary hover:underline">
                              Learn how to calculate your golf handicap step by step →
                            </Link>
                          </p>
                        )}
                        {item.id === "item-6" && (
                          <p className="mt-2">
                            <Link to="/guides/how-to-track-golf-scores" className="text-primary hover:underline">
                              Discover the best methods for tracking golf scores →
                            </Link>
                          </p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </section>
            
            {/* Enhanced related links section */}
            <section className="mb-8 p-6 bg-muted/30 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Related Golf Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Golf Score Tracking Guides</h4>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <Link to="/guides/how-to-track-golf-scores" className="text-primary hover:underline">
                        How to Track Golf Scores: Complete Guide
                      </Link>
                    </li>
                    <li>
                      <Link to="/guides/golf-statistics-tracker" className="text-primary hover:underline">
                        Golf Statistics Tracker Guide
                      </Link>
                    </li>
                    <li>
                      <Link to="/guides/best-golf-score-apps" className="text-primary hover:underline">
                        Best Golf Score Apps Comparison
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Golf Analytics & Performance</h4>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <Link to="/guides/golf-handicap-calculator" className="text-primary hover:underline">
                        Golf Handicap Calculator Guide
                      </Link>
                    </li>
                    <li>
                      <Link to="/guides/golf-performance-analytics" className="text-primary hover:underline">
                        Golf Performance Analytics
                      </Link>
                    </li>
                    <li>
                      <Link to="/blog/stableford-scoring" className="text-primary hover:underline">
                        Stableford Scoring Guide
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
            
            <div className="text-center mt-12">
              <Link to="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
