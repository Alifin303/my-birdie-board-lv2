import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQ() {
  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions | MyBirdieBoard Golf Tracking</title>
        <meta 
          name="description" 
          content="Find answers to common questions about MyBirdieBoard's golf score tracking, handicap calculations, and performance analytics."
        />
        <link rel="canonical" href="https://mybirdieboard.com/faq" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is MyBirdieBoard?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "MyBirdieBoard is your personal golf score tracker. It lets you log every round you play, view your score history at each course, and compare your performance against other golfers on course leaderboards. It's the perfect tool to track your progress and aim for lower scores!"
                  }
                },
                {
                  "@type": "Question",
                  "name": "How does the course leaderboard work?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "The course leaderboards show how your scores compare to other golfers at the same course. You can filter the leaderboards by date (monthly, yearly, or all-time) and choose to display either gross or net scores. Your best round's position is highlighted so you always know where you stand!"
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I track my past rounds?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! MyBirdieBoard allows you to store and review all your previous rounds. Whether you played the course last week or last year, you'll have a full record of your scores, helping you see your progress over time."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Does MyBirdieBoard track my handicap?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! MyBirdieBoard calculates your handicap using official methods. However, please note that while this gives you a clear and accurate reflection of your playing ability, some golf clubs may not recognize it as an official club handicap."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How much does MyBirdieBoard cost?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We offer a simple, affordable monthly subscription that gives you full access to score tracking, course leaderboards, and round history. Check out our website for the latest pricing!"
                  }
                },
                {
                  "@type": "Question",
                  "name": "Why should I use MyBirdieBoard instead of a notebook or spreadsheet?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "With MyBirdieBoard, your scores are stored safely online and accessible from any device. Plus, you get dynamic leaderboards, round comparisons, and visual progress tracking — something a notebook just can't do!"
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is MyBirdieBoard only available in certain countries?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Not at all! MyBirdieBoard has a database of over 30,000 golf courses worldwide. Plus, if a course isn't already listed, you can easily add it yourself. So no matter where you are or where you travel to play golf, MyBirdieBoard is ready to track your rounds and keep you connected to your game."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How do I subscribe?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "It's simple! Click the Get Started button on the homepage of our website, create your account, and you'll be on your way to better tracking and better scores in no time."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I cancel my subscription?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! You can cancel anytime. If you cancel mid-billing cycle, you'll still have access until your next billing date."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How do I add a new golf course that isn't listed?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "If you don't find your course in our database, you can easily add it by navigating to 'Add Round' and selecting 'Add New Course'. You'll need to provide the course name, location, and hole information including par and distances."
                  }
                }
              ]
            }
          `}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <header className="bg-primary text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-lg max-w-2xl mx-auto">
              Find answers to common questions about using MyBirdieBoard to track your golf performance
            </p>
          </div>
        </header>

        <main className="container mx-auto py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="mb-12">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-medium">
                  What is MyBirdieBoard?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    MyBirdieBoard is your personal golf score tracker. It lets you log every round you play, view your score history at each course, and compare your performance against other golfers on course leaderboards. It's the perfect tool to track your progress and aim for lower scores!
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-medium">
                  How does the course leaderboard work?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    The course leaderboards show how your scores compare to other golfers at the same course. You can filter the leaderboards by date (monthly, yearly, or all-time) and choose to display either gross or net scores. Your best round's position is highlighted so you always know where you stand!
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg font-medium">
                  Can I track my past rounds?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Yes! MyBirdieBoard allows you to store and review all your previous rounds. Whether you played the course last week or last year, you'll have a full record of your scores, helping you see your progress over time.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg font-medium">
                  Does MyBirdieBoard track my handicap?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Yes! MyBirdieBoard calculates your handicap using official methods. However, please note that while this gives you a clear and accurate reflection of your playing ability, some golf clubs may not recognize it as an official club handicap.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-lg font-medium">
                  How much does MyBirdieBoard cost?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    We offer a simple, affordable monthly subscription that gives you full access to score tracking, course leaderboards, and round history. Check out our website for the latest pricing!
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-lg font-medium">
                  Why should I use MyBirdieBoard instead of a notebook or spreadsheet?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    With MyBirdieBoard, your scores are stored safely online and accessible from any device. Plus, you get dynamic leaderboards, round comparisons, and visual progress tracking — something a notebook just can't do!
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger className="text-lg font-medium">
                  Is MyBirdieBoard only available in certain countries?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Not at all! MyBirdieBoard has a database of over 30,000 golf courses worldwide. Plus, if a course isn't already listed, you can easily add it yourself. So no matter where you are or where you travel to play golf, MyBirdieBoard is ready to track your rounds and keep you connected to your game.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8">
                <AccordionTrigger className="text-lg font-medium">
                  How do I subscribe?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    It's simple! Click the Get Started button on the homepage of our website, create your account, and you'll be on your way to better tracking and better scores in no time.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9">
                <AccordionTrigger className="text-lg font-medium">
                  Can I cancel my subscription?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Yes! You can cancel anytime. If you cancel mid-billing cycle, you'll still have access until your next billing date.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10">
                <AccordionTrigger className="text-lg font-medium">
                  How do I add a new golf course that isn't listed?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    If you don't find your course in our database, you can easily add it by navigating to 'Add Round' and selecting 'Add New Course'. You'll need to provide the course name, location, and hole information including par and distances.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

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
