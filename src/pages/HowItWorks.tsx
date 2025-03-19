
import React from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Helmet } from 'react-helmet-async';

const HowItWorks = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>How It Works | MyBirdieBoard</title>
        <meta name="description" content="Learn how to use MyBirdieBoard to track your golf scores, analyze your performance, and improve your game." />
        <link rel="canonical" href="https://mybirdieboard.com/howitworks" />
        <meta name="robots" content="noindex" /> {/* Hide during development */}
      </Helmet>
      
      <SiteHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">How MyBirdieBoard Works</h1>
          <p className="text-lg text-muted-foreground mb-8 text-center">
            A step-by-step guide to using MyBirdieBoard's powerful golf tracking features
          </p>
          
          <Tabs defaultValue="scorecards" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
              <TabsTrigger value="scorecards">Scorecards</TabsTrigger>
              <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
              <TabsTrigger value="handicap">Handicap</TabsTrigger>
              <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
            </TabsList>

            <TabsContent value="scorecards" className="space-y-8">
              <FeatureSection
                title="Upload & Store Your Scorecards"
                description="Keep a complete history of every round you play."
                steps={[
                  {
                    title: "Log in to your account",
                    description: "Access your personalized dashboard to start tracking your golf scores.",
                    imagePath: "/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png"
                  },
                  {
                    title: "Navigate to 'Add Round'",
                    description: "From your dashboard, click the 'Add Round' button to begin the scorecard entry process.",
                    imagePath: "/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png"
                  },
                  {
                    title: "Enter your scores",
                    description: "Input your scores for each hole, along with any statistics or notes you want to track.",
                    imagePath: "/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png"
                  },
                  {
                    title: "Save and review",
                    description: "After entering your round details, save your scorecard to your profile for future reference.",
                    imagePath: "/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png"
                  }
                ]}
              />
            </TabsContent>

            <TabsContent value="progress" className="space-y-8">
              <FeatureSection
                title="Visual Progress Tracking"
                description="See your improvement in real-time with detailed analytics."
                steps={[
                  {
                    title: "Access your statistics dashboard",
                    description: "Navigate to the 'Stats' section of your dashboard to view your performance metrics.",
                    imagePath: "/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png"
                  },
                  {
                    title: "Analyze scoring trends",
                    description: "View charts showing your average scores over time to identify improvement patterns.",
                    imagePath: "/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png"
                  },
                  {
                    title: "Identify strengths and weaknesses",
                    description: "Examine detailed breakdowns of your performance by hole type and course section.",
                    imagePath: "/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png"
                  },
                  {
                    title: "Set improvement goals",
                    description: "Based on your stats, set achievable goals for different aspects of your game.",
                    imagePath: "/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png"
                  }
                ]}
              />
            </TabsContent>

            <TabsContent value="handicap" className="space-y-8">
              <FeatureSection
                title="Handicap Generator"
                description="Get a reliable, data-driven handicap calculation."
                steps={[
                  {
                    title: "Enter your rounds",
                    description: "Your handicap calculation starts with consistently logging your rounds in the system.",
                    imagePath: "/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png"
                  },
                  {
                    title: "View your handicap calculation",
                    description: "Access your current handicap from your dashboard, automatically updated with each new round.",
                    imagePath: "/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png"
                  },
                  {
                    title: "Track changes over time",
                    description: "Monitor how your handicap improves as you play more rounds and improve your skills.",
                    imagePath: "/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png"
                  },
                  {
                    title: "Use for official play",
                    description: "Apply your calculated handicap when playing in tournaments or friendly competitions.",
                    imagePath: "/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png"
                  }
                ]}
              />
            </TabsContent>

            <TabsContent value="leaderboards" className="space-y-8">
              <FeatureSection
                title="Course Leaderboards"
                description="Compete with friends and other golfers at your favorite courses."
                steps={[
                  {
                    title: "Find your course",
                    description: "Search for the course you've played in the course directory.",
                    imagePath: "/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png"
                  },
                  {
                    title: "View the leaderboard",
                    description: "Access the course leaderboard to see how your scores compare to other golfers.",
                    imagePath: "/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png"
                  },
                  {
                    title: "Filter results",
                    description: "Sort by gross score, net score, or specific date ranges to customize your view.",
                    imagePath: "/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png"
                  },
                  {
                    title: "Challenge friends",
                    description: "Invite friends to join MyBirdieBoard and compete on the same leaderboards.",
                    imagePath: "/lovable-uploads/5c3a0a2c-ab7e-49e8-ab39-c9e3770cc0e7.png"
                  }
                ]}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
};

interface Step {
  title: string;
  description: string;
  imagePath: string;
}

interface FeatureSectionProps {
  title: string;
  description: string;
  steps: Step[];
}

const FeatureSection = ({ title, description, steps }: FeatureSectionProps) => {
  return (
    <section>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      
      <div className="space-y-12">
        {steps.map((step, index) => (
          <StepCard key={index} step={step} stepNumber={index + 1} />
        ))}
      </div>
    </section>
  );
};

interface StepCardProps {
  step: Step;
  stepNumber: number;
}

const StepCard = ({ step, stepNumber }: StepCardProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="md:grid md:grid-cols-2 md:gap-6">
        <div className="order-2 md:order-1">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3">
                {stepNumber}
              </div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
            </div>
            <p className="text-muted-foreground">{step.description}</p>
          </CardContent>
        </div>
        
        <div className="order-1 md:order-2 bg-muted flex items-center justify-center p-6">
          <div className="rounded-md overflow-hidden border border-border shadow-md w-full">
            <img 
              src={step.imagePath} 
              alt={`Step ${stepNumber}: ${step.title}`}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default HowItWorks;
