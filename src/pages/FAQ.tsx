
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
                  "name": "How do I track my golf scores with MyBirdieBoard?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "MyBirdieBoard makes score tracking simple. After creating an account, you can add a new round by selecting your course, entering your scores for each hole, and saving. Your scores will be automatically analyzed and added to your performance dashboard."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How is my handicap calculated?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "MyBirdieBoard calculates your handicap using the World Handicap System (WHS) method. We take your 8 best scores from your most recent 20 rounds, adjust them for course difficulty, and generate your handicap index."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I share my scores with friends?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! MyBirdieBoard allows you to share your scores and compete on course leaderboards with friends. You can invite friends to join your group or view public leaderboards for courses you've played."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What analytics does MyBirdieBoard provide?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "MyBirdieBoard offers comprehensive analytics including: score trends over time, strokes gained/lost per hole, putting performance, driving accuracy, greens in regulation (GIR), and personalized improvement suggestions based on your stats."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is MyBirdieBoard available on mobile devices?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, MyBirdieBoard is fully responsive and works on all mobile devices through your web browser. This allows you to track scores directly from the course using your smartphone."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How do I add a new golf course that isn't listed?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "If you don't find your course in our database, you can easily add it by navigating to 'Add Round' and selecting 'Add New Course'. You'll need to provide the course name, location, and hole information including par and distances."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I import my scores from other platforms?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We're currently developing an import feature to allow you to bring your scoring history from other platforms. Stay tuned for updates on this feature!"
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
                  How do I track my golf scores with MyBirdieBoard?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    MyBirdieBoard makes score tracking simple. After creating an account, you can add a new round by selecting your course, entering your scores for each hole, and saving. Your scores will be automatically analyzed and added to your performance dashboard.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-medium">
                  How is my handicap calculated?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    MyBirdieBoard calculates your handicap using the World Handicap System (WHS) method. We take your 8 best scores from your most recent 20 rounds, adjust them for course difficulty, and generate your handicap index.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg font-medium">
                  Can I share my scores with friends?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Yes! MyBirdieBoard allows you to share your scores and compete on course leaderboards with friends. You can invite friends to join your group or view public leaderboards for courses you've played.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg font-medium">
                  What analytics does MyBirdieBoard provide?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    MyBirdieBoard offers comprehensive analytics including: score trends over time, strokes gained/lost per hole, putting performance, driving accuracy, greens in regulation (GIR), and personalized improvement suggestions based on your stats.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-lg font-medium">
                  Is MyBirdieBoard available on mobile devices?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Yes, MyBirdieBoard is fully responsive and works on all mobile devices through your web browser. This allows you to track scores directly from the course using your smartphone.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-lg font-medium">
                  How do I add a new golf course that isn't listed?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    If you don't find your course in our database, you can easily add it by navigating to 'Add Round' and selecting 'Add New Course'. You'll need to provide the course name, location, and hole information including par and distances.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger className="text-lg font-medium">
                  Can I import my scores from other platforms?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    We're currently developing an import feature to allow you to bring your scoring history from other platforms. Stay tuned for updates on this feature!
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="text-center mt-12">
              <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
              <p className="mb-6 text-muted-foreground">We're here to help. Feel free to reach out to us for more information.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="default">Contact Support</Button>
                <Link to="/">
                  <Button variant="outline">Back to Home</Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
