import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
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
  answer: "MyBirdieBoard costs £2.99 per month — cancel anytime. The price is shown in GBP but will be converted to your local currency at checkout. Plus, all new subscribers get a 7-day free trial — cancel before the trial ends if it's not for you, and you won't be charged."
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
}];
export default function FAQ() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const generateStructuredData = () => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqItems.map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        },
        "position": parseInt(item.id.split('-')[1])
      }))
    };
    return JSON.stringify(structuredData);
  };
  return (
    <>
      <Helmet>
        <title>Golf Score Tracking FAQ | MyBirdieBoard Analytics & Handicap Calculator</title>
        <meta name="description" content="Find answers about golf score tracking, golf analytics, handicap calculations, and performance statistics. Learn how to use MyBirdieBoard for better golf performance." />
        <meta name="keywords" content="golf score tracking FAQ, golf analytics questions, golf handicap calculator help, golf statistics tracker guide, course leaderboards FAQ" />
        <link rel="canonical" href="https://mybirdieboard.com/faq" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How does golf score tracking work?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "MyBirdieBoard provides digital golf score tracking that automatically calculates your handicap, tracks performance analytics, and maintains course leaderboards."
                }
              },
              {
                "@type": "Question", 
                "name": "What golf analytics does MyBirdieBoard provide?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We provide comprehensive golf performance analytics including score trends, handicap progression, course-specific statistics, and detailed performance metrics."
                }
              },
              {
                "@type": "Question",
                "name": "How accurate is the golf handicap calculator?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our golf handicap calculator follows WHS (World Handicap System) standards for accurate handicap calculations based on your golf score tracking data."
                }
              }
            ]
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-lg max-w-2xl mx-auto text-center">Got questions? We’ve got answers.
Explore how MyBirdieBoard — your digital golf journal — helps you track performance, reflect on rounds, and understand your game better.</p>
          </div>
        </header>
        
        <main className="container mx-auto py-12 px-4">
          <div className="max-w-3xl mx-auto">
            {/* Add AI-friendly article summary section */}
            <section className="mb-10 prose max-w-none">
              <h2 className="sr-only">About MyBirdieBoard Golf Score Tracker</h2>
              <p className="text-lg text-muted-foreground text-center">MyBirdieBoard is your digital golf journal — built for golfers who want more than just a score.
Track your rounds, stats, and story in one place. With features like detailed round history, course leaderboards, handicap tracking, and post-round performance insights, MyBirdieBoard helps you reflect, improve, and celebrate your journey — no matter your skill level.
Start your 7-day free trial, then just £2.99/month.</p>
            </section>
            
            <section itemScope itemType="https://schema.org/FAQPage">
              <Accordion type="single" collapsible className="mb-12">
                {faqItems.map(item => <AccordionItem key={item.id} value={item.id} itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                    <AccordionTrigger className="text-lg font-medium text-left" itemProp="name">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                      <p className="text-muted-foreground" itemProp="text">
                        {item.answer}
                      </p>
                    </AccordionContent>
                  </AccordionItem>)}
              </Accordion>
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
