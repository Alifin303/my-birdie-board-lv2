
import React from 'react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { SocialFooter } from '@/components/SocialFooter';
import { UserPlus, HelpCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const HowItWorks = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>How It Works | MyBirdieBoard</title>
        <meta name="description" content="Learn how to use MyBirdieBoard to track your golf scores, analyze your performance, and improve your game." />
        <link rel="canonical" href="https://mybirdieboard.com/howitworks" />
        <meta name="robots" content="noindex" /> {/* Hide during development */}
      </Helmet>
      
      <div 
        className="relative flex-1 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://www.suttongreengc.co.uk/wp-content/uploads/2023/02/membership-featured.jpg')`,
          backgroundColor: "#2C4A3B", // Fallback color if image fails to load
        }}
      >
        {/* Dark overlay div */}
        <div className="absolute inset-0 bg-black opacity-40 z-0" aria-hidden="true"></div>
        
        <header className="absolute top-0 left-0 right-0 z-10">
          <div className="container mx-auto px-4 py-2">
            <nav className="flex items-center justify-between">
              <Link to="/" className="flex items-center" aria-label="MyBirdieBoard Home">
                <img 
                  src="/lovable-uploads/e65e4018-8608-4c06-aefc-191f9e9de8e0.png" 
                  alt="MyBirdieBoard Logo" 
                  className="h-32 w-auto object-contain" 
                />
              </Link>
            </nav>
          </div>
        </header>
        
        <main className="relative z-[1] pt-32 sm:pt-16 px-4 pb-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 animate-fade-in">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white drop-shadow-md">How MyBirdieBoard Works</h1>
              <p className="text-lg text-white/90 mb-6 max-w-3xl mx-auto">
                A step-by-step guide to using MyBirdieBoard's powerful golf tracking features
              </p>
            </div>
            
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl mb-8">
              <CardContent className="p-6">
                <Tabs defaultValue="scorecards" className="w-full">
                  <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8 bg-white/20">
                    <TabsTrigger value="scorecards" className="text-white data-[state=active]:bg-accent data-[state=active]:text-white">
                      Scorecards
                    </TabsTrigger>
                    <TabsTrigger value="progress" className="text-white data-[state=active]:bg-accent data-[state=active]:text-white">
                      Progress Tracking
                    </TabsTrigger>
                    <TabsTrigger value="handicap" className="text-white data-[state=active]:bg-accent data-[state=active]:text-white">
                      Handicap
                    </TabsTrigger>
                    <TabsTrigger value="leaderboards" className="text-white data-[state=active]:bg-accent data-[state=active]:text-white">
                      Leaderboards
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="scorecards" className="space-y-8">
                    <FeatureSection
                      title="Upload & Store Your Scorecards"
                      description="Keep a complete history of every round you play."
                      steps={[
                        {
                          title: "Log in to your account",
                          description: "Access your personalized dashboard to start tracking your golf scores.",
                          imagePath: "/lovable-uploads/32ca8a31-c9e7-45c0-a6ba-9c4b73fa3bf5.png"
                        },
                        {
                          title: "Navigate to 'Add Round'",
                          description: "From your dashboard, click the 'Add Round' button in the top menu to begin the scorecard entry process.",
                          imagePath: "/lovable-uploads/76c40c17-e8c3-45eb-826c-66baf2d9a46a.png"
                        },
                        {
                          title: "Enter your scores",
                          description: "Input your scores for each hole, along with any statistics or notes you want to track.",
                          imagePath: "/lovable-uploads/82c4f1ce-ff1d-4ce1-9f81-e9cd7f2566a9.png"
                        },
                        {
                          title: "Save and review",
                          description: "After entering your round details, save your scorecard to your profile for future reference.",
                          imagePath: "/lovable-uploads/6a7fda2b-ff3c-4ee2-9073-6cff5644d48c.png"
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
                          imagePath: "/lovable-uploads/9a4a4c23-d1d7-48a2-8df3-fb2efca73cd2.png"
                        },
                        {
                          title: "Analyze scoring trends",
                          description: "View charts showing your average scores over time to identify improvement patterns.",
                          imagePath: "/lovable-uploads/3fcd2bcf-2e7f-4ccc-a4a3-0c4e76d7d67c.png"
                        },
                        {
                          title: "Identify strengths and weaknesses",
                          description: "Examine detailed breakdowns of your performance by hole type and course section.",
                          imagePath: "/lovable-uploads/23a9e6b8-6d22-430c-b7ca-a48d5dd5db57.png"
                        },
                        {
                          title: "Set improvement goals",
                          description: "Based on your stats, set achievable goals for different aspects of your game.",
                          imagePath: "/lovable-uploads/e3f35ef4-75aa-4635-8d7c-5c1c05f5afc3.png"
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
                          imagePath: "/lovable-uploads/b29f7834-9bb4-4df1-90c9-fa3b8e95e8de.png"
                        },
                        {
                          title: "View your handicap calculation",
                          description: "Access your current handicap from your dashboard, automatically updated with each new round.",
                          imagePath: "/lovable-uploads/db9ad44b-77c1-43cd-851a-a1b8a3b21d24.png"
                        },
                        {
                          title: "Track changes over time",
                          description: "Monitor how your handicap improves as you play more rounds and improve your skills.",
                          imagePath: "/lovable-uploads/90d3feec-1e62-47d2-980a-4a1ed1c0c9fc.png"
                        },
                        {
                          title: "Use for official play",
                          description: "Apply your calculated handicap when playing in tournaments or friendly competitions.",
                          imagePath: "/lovable-uploads/c7dfab67-61d9-4c23-b14c-aebba5ae9e9e.png"
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
                          imagePath: "/lovable-uploads/8b8e1efa-8f5c-455c-9fb1-72b70e4f4ce7.png"
                        },
                        {
                          title: "View the leaderboard",
                          description: "Access the course leaderboard to see how your scores compare to other golfers.",
                          imagePath: "/lovable-uploads/3b2e835c-e2ac-4a2a-95b8-10f3e5ed41e1.png"
                        },
                        {
                          title: "Filter results",
                          description: "Sort by gross score, net score, or specific date ranges to customize your view.",
                          imagePath: "/lovable-uploads/d6d81aed-5dbc-479c-8ab6-5dcfb071a15e.png"
                        },
                        {
                          title: "Challenge friends",
                          description: "Invite friends to join MyBirdieBoard and compete on the same leaderboards.",
                          imagePath: "/lovable-uploads/1c14ddb8-8fc2-414e-8c10-ac3c3c0cdc9e.png"
                        }
                      ]}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
        
        {/* Call to action section */}
        <section aria-labelledby="cta-heading" className="w-full py-6 bg-black/30 backdrop-blur-sm mt-4 relative z-[1]">
          <div className="max-w-5xl mx-auto text-center px-4">
            <h2 id="cta-heading" className="text-xl font-bold text-white mb-3">Ready to take your game to the next level?</h2>
            <p className="text-base text-white/90 mb-4">Find out how MyBirdieBoard can help improve your golf game!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/">
                <Button 
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 h-12 shadow-lg transition-all duration-300"
                  aria-label="Sign up for MyBirdieBoard"
                >
                  <UserPlus className="mr-2 h-5 w-5" aria-hidden="true" />
                  Start Your Free Trial
                </Button>
              </Link>
              <Link to="/faq">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-white/10 hover:bg-white/20 text-white px-8 h-12 shadow-lg transition-all duration-300"
                  aria-label="View frequently asked questions"
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Read FAQ
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
      <SocialFooter />
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
        <h2 className="text-2xl font-bold mb-2 text-white">{title}</h2>
        <p className="text-white/80">{description}</p>
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
    <Card className="overflow-hidden bg-white/10 backdrop-blur-md border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="md:grid md:grid-cols-2 md:gap-6">
        <div className="order-2 md:order-1">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-accent text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3">
                {stepNumber}
              </div>
              <h3 className="text-xl font-semibold text-white">{step.title}</h3>
            </div>
            <p className="text-white/80">{step.description}</p>
            <Button 
              variant="link" 
              className="text-white p-0 hover:text-white/80 mt-4 text-sm"
              disabled
            >
              Learn More <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
            </Button>
          </CardContent>
        </div>
        
        <div className="order-1 md:order-2 bg-black/20 flex items-center justify-center p-6">
          <div className="rounded-md overflow-hidden border border-white/20 shadow-md w-full">
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
