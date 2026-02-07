
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LoginDialog } from "@/components/LoginDialog";
import { User, ArrowLeft, GraduationCap, Users, Video, MapPin } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const lessonTypes = [
  {
    title: "Private Golf Lessons",
    description: "One-on-one instruction tailored to your specific needs",
    benefits: ["Personalized attention", "Custom lesson plans", "Flexible scheduling", "Faster improvement"],
    icon: <GraduationCap className="h-8 w-8 text-primary" />
  },
  {
    title: "Group Golf Lessons",
    description: "Learn with others in a fun, social environment",
    benefits: ["Cost-effective", "Social learning", "Peer motivation", "Group dynamics"],
    icon: <Users className="h-8 w-8 text-primary" />
  },
  {
    title: "Online Golf Lessons",
    description: "Learn from professional instructors from anywhere",
    benefits: ["Convenient access", "Replay lessons", "Progress tracking", "Global instructors"],
    icon: <Video className="h-8 w-8 text-primary" />
  },
  {
    title: "Golf Clinics",
    description: "Intensive focused sessions on specific skills",
    benefits: ["Skill specialization", "Intensive practice", "Expert guidance", "Structured learning"],
    icon: <MapPin className="h-8 w-8 text-primary" />
  }
];

export default function GolfLessons() {
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  return (
    <>
      <Helmet>
        {/* Title <60 chars, Description <160 chars */}
        <title>Find Golf Lessons Near You | MyBirdieBoard</title>
        <meta name="description" content="Find golf lessons and professional instruction. Private lessons, group classes, online coaching, and golf clinics." />
        <meta name="keywords" content="golf lessons, golf instruction, golf lessons near me, private golf lessons, golf coach" />
        <link rel="canonical" href="https://mybirdieboard.com/golf-lessons" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Golf Lessons & Professional Instruction",
            "description": "Find golf lessons and professional instruction to improve your golf game.",
            "url": "https://mybirdieboard.com/golf-lessons",
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": lessonTypes.map((lesson, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": lesson.title,
                "description": lesson.description
              }))
            }
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-white py-12">
          <div className="container mx-auto px-4">
            <BreadcrumbNav />
            <div className="mt-4">
              <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Golf Lessons & Professional Instruction</h1>
              <p className="text-lg text-white/90">Find the perfect golf instruction to improve your game</p>
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
          <div className="max-w-6xl mx-auto">
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Types of Golf Instruction</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {lessonTypes.map((lesson) => (
                  <Card key={lesson.title} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-3 mb-2">
                        {lesson.icon}
                        <CardTitle className="text-xl">{lesson.title}</CardTitle>
                      </div>
                      <CardDescription>{lesson.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {lesson.benefits.map((benefit) => (
                          <li key={benefit} className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-accent rounded-full mr-2" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">How to Choose Golf Lessons</h2>
              <div className="prose prose-lg max-w-none">
                <p>Selecting the right golf instruction is crucial for improving your game efficiently. Consider these factors when choosing golf lessons:</p>
                
                <h3>Instructor Qualifications</h3>
                <p>Look for certified PGA professionals or instructors with proven teaching experience. Check reviews and ask about their teaching philosophy and methods.</p>
                
                <h3>Learning Style Match</h3>
                <p>Some golfers learn better through technical explanations, while others prefer feel-based instruction. Find an instructor whose teaching style matches how you learn best.</p>
                
                <h3>Track Your Progress</h3>
                <p>The best golf lessons include measurable goals and progress tracking. Use apps like MyBirdieBoard to monitor your improvement and validate that your lessons are paying off.</p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">What to Expect from Golf Lessons</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Beginner Lessons</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">•</span>
                      <span>Basic golf fundamentals and rules</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">•</span>
                      <span>Proper grip, stance, and posture</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">•</span>
                      <span>Introduction to different clubs</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">•</span>
                      <span>Basic swing mechanics</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Advanced Lessons</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">•</span>
                      <span>Shot shaping and trajectory control</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">•</span>
                      <span>Course management strategies</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">•</span>
                      <span>Advanced short game techniques</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">•</span>
                      <span>Mental game and pressure situations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <div className="bg-accent/10 rounded-lg p-8">
              <h3 className="text-2xl font-semibold mb-4">Track Your Lesson Progress</h3>
              <p className="text-muted-foreground mb-6">Monitor your improvement from golf lessons with detailed performance tracking and analytics.</p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Related Resources:</h4>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <Link to="/golf-tips" className="text-primary hover:underline">Golf Tips & Strategies</Link>
                    <Link to="/guides/golf-performance-analytics" className="text-primary hover:underline">Performance Analytics</Link>
                    <Link to="/guides/how-to-track-golf-scores" className="text-primary hover:underline">Score Tracking</Link>
                    <Link to="/courses" className="text-primary hover:underline">Find Practice Courses</Link>
                  </div>
                </div>
                <Link to="/">
                  <Button size="lg" className="bg-accent hover:bg-accent/90">
                    Start Tracking Your Progress
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
