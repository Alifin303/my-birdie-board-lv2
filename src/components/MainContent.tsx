import React from 'react';
import { Button } from './ui/button';
import { ArrowRight, MapPin, ClipboardList, TrendingUp, Medal, BarChart2, HelpCircle, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
interface MainContentProps {
  onStartSignup: () => void;
}
export const MainContent = ({
  onStartSignup
}: MainContentProps) => {
  return <div className="w-full mx-auto flex flex-col justify-between min-h-screen">
      <section aria-labelledby="hero-heading" className="flex-grow flex flex-col justify-center items-center text-left md:text-left px-[16px] py-px my-0">
        <div className="max-w-5xl animate-fade-in mb-4 mx-auto bg-black/45 backdrop-blur-sm rounded-xl px-6 py-4 shadow-lg">
          <h2 id="hero-heading" className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2 drop-shadow-lg my-[50px] text-center md:text-4xl">
            Tired of your phone on the course?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 text-center mb-6 drop-shadow-md md:text-2xl">
            Play with just a scorecard. Log it in seconds afterwards — and never lose another round.
          </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-4 justify-center items-center">
              <Button size="lg" onClick={onStartSignup} data-id="cta_hero_start_tracking" aria-label="Start tracking your golf rounds" className="text-accent-foreground text-lg px-6 sm:px-8 h-auto py-3 shadow-lg transition-all duration-300 bg-secondary-foreground w-full sm:w-auto">
                <UserPlus className="mr-2 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm sm:text-base md:text-lg">Start Tracking My Rounds</span>
              </Button>
              <Link to="/demo" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" data-id="cta_hero_watch_demo" aria-label="See how MyBirdieBoard works" className="text-lg px-6 sm:px-8 h-auto py-3 shadow-lg transition-all duration-300 w-full sm:w-auto justify-center border-2 border-secondary-foreground/20">
                  <BarChart2 className="mr-2 h-5 w-5 flex-shrink-0" />
                  <span className="text-sm sm:text-base md:text-lg">See How It Works</span>
                </Button>
              </Link>
            </div>
            
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm sm:text-base text-white/90 mt-6 justify-center items-center">
              <div className="flex items-center gap-1.5">
                <span className="text-accent-foreground">✓</span>
                <span>No phone on the course</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-accent-foreground">✓</span>
                <span>Add rounds in seconds after you play</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-accent-foreground">✓</span>
                <span>Your golf history, saved forever</span>
              </div>
            </div>
        </div>
      </section>
      
      
      <section aria-labelledby="features-heading" className="w-full max-w-5xl mx-auto px-4 pb-8">
        <h2 id="features-heading" className="text-2xl sm:text-3xl font-bold text-center text-white mb-4 drop-shadow-md">Key Features of MyBirdieBoard</h2>
        
        <div className="backdrop-blur-sm rounded-xl p-4 shadow-lg bg-black/35">
          <div className="flex flex-col lg:flex-row gap-6 justify-between">
            <div className="flex justify-center order-1 lg:justify-start lg:w-1/2 lg:order-1 mb-6 lg:mb-0">
              <img 
                src="/lovable-uploads/cab862e7-c7cc-4446-9f24-b1c57c6531a0.png" 
                alt="MyBirdieBoard App Screenshots showing golf score tracking dashboard with handicap calculator and performance analytics" 
                className="max-w-full h-auto object-contain rounded-lg"
                loading="lazy"
                decoding="async"
                width="600"
                height="400"
              />
            </div>
            
            <div className="lg:w-1/2 order-2 lg:order-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  <CardContent className="p-3 flex flex-col h-full bg-stone-200 rounded-xl">
                    <div className="rounded-full p-2 w-fit mb-2 bg-[2f4c3d] bg-secondary-foreground">
                      <MapPin className="h-4 w-4 text-white" aria-hidden="true" />
                    </div>
                    <h3 className="text-sm font-bold mb-2 text-secondary-foreground">Your Personal Golf Passport</h3>
                    <p className="mb-2 text-xs text-secondary-foreground">Every round drops a pin on your own course map — building a visual record of everywhere you've played, season after season. It's the kind of long-term golf memory a scorecard alone could never keep.</p>
                    <div className="mt-auto pt-1">
                      <Link to="/demo" aria-label="See your golf map in the demo" className="p-0 text-xs text-secondary-foreground hover:underline inline-flex items-center">
                        See your golf map <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  <CardContent className="p-3 flex flex-col h-full bg-stone-200 rounded-xl">
                    <div className="rounded-full p-2 w-fit mb-2 bg-secondary-foreground bg-[2f4c3d]">
                      <ClipboardList className="h-4 w-4 text-white" aria-hidden="true" />
                    </div>
                    <h3 className="text-sm font-bold mb-2 text-secondary-foreground">Log Any Round, Your Way</h3>
                    <p className="mb-2 text-xs text-secondary-foreground">Full support for stroke play and Stableford scoring, plus advanced stats like putts, penalties, and greens in regulation — logged in seconds after you play, no phone needed on the course.</p>
                    <div className="mt-auto pt-1">
                      <Link to="/guides/how-to-track-golf-scores" aria-label="See how scoring works" className="p-0 text-xs text-secondary-foreground hover:underline inline-flex items-center">
                        See how scoring works <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  <CardContent className="p-3 flex flex-col h-full bg-stone-200 rounded-xl">
                    <div className="rounded-full p-2 w-fit mb-2 bg-secondary-foreground">
                      <TrendingUp className="h-4 w-4 text-white" aria-hidden="true" />
                    </div>
                    <h3 className="text-sm font-bold mb-2 text-secondary-foreground">Automatic WHS Handicap</h3>
                    <p className="mb-2 text-xs text-secondary-foreground">Your handicap index updates automatically using the World Handicap System as you add rounds — a true, current picture of your game, no manual calculation required.</p>
                    <div className="mt-auto pt-1 bg-transparent">
                      <Link to="/guides/golf-handicap-calculator" aria-label="Learn how handicap tracking works" className="p-0 text-xs text-secondary-foreground hover:underline inline-flex items-center">
                        Learn how handicap tracking works <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/10 backdrop-blur-md border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  <CardContent className="p-3 flex flex-col h-full bg-stone-200 rounded-xl">
                    <div className="rounded-full p-2 w-fit mb-2 bg-[2f4c3d] bg-secondary-foreground">
                      <Medal className="h-4 w-4 text-white" aria-hidden="true" />
                    </div>
                    <h3 className="text-sm font-bold mb-2 text-secondary-foreground">Gross and Net Leaderboards, Every Course</h3>
                    <p className="mb-2 text-xs text-secondary-foreground">See exactly where you rank — gross and net — at every course you've played, not just your home club.</p>
                    <div className="mt-auto pt-1">
                      <Link to="/blog/course-leaderboards" aria-label="See leaderboards in action" className="p-0 text-xs text-secondary-foreground hover:underline inline-flex items-center">
                        See leaderboards in action <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Why I Built MyBirdieBoard — founder teaser */}
      <section aria-labelledby="why-heading" className="w-full max-w-5xl mx-auto px-4 pb-6">
        <h2 id="why-heading" className="text-2xl sm:text-3xl font-bold text-center text-white mb-4 drop-shadow-md">
          Why I Built MyBirdieBoard
        </h2>
        <div className="text-sm sm:text-base text-white/90 text-center mb-5 bg-black/35 backdrop-blur-sm px-4 py-3 rounded-lg md:text-lg">
          <p>Built by a golfer who was tired of losing track of his rounds. No club membership, no idea of his real handicap, and a phone battery that died mid-round.</p>
        </div>
        <div className="text-center mb-6">
          <Link to="/about" aria-label="Read the full founder story on the About page" className="inline-flex items-center text-accent-foreground font-semibold hover:underline">
            Read the full story <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="w-24 h-0.5 bg-white/30 mx-auto mb-8"></div>
      </section>
      
      {/* How It Works Strip */}
      <section aria-labelledby="how-it-works-heading" className="w-full max-w-5xl mx-auto px-4 py-8">
        <h2 id="how-it-works-heading" className="text-2xl sm:text-3xl font-bold text-center text-white mb-6 drop-shadow-md">
          How MyBirdieBoard Fits Your Game
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/35 backdrop-blur-sm rounded-lg p-5 text-center">
            <div className="w-10 h-10 bg-secondary-foreground rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">1</span>
            </div>
            <p className="text-white/90 text-sm sm:text-base">Play your round — no phone, no distractions</p>
          </div>
          <div className="bg-black/35 backdrop-blur-sm rounded-lg p-5 text-center">
            <div className="w-10 h-10 bg-secondary-foreground rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">2</span>
            </div>
            <p className="text-white/90 text-sm sm:text-base">Enter your scores in seconds afterward</p>
          </div>
          <div className="bg-black/35 backdrop-blur-sm rounded-lg p-5 text-center">
            <div className="w-10 h-10 bg-secondary-foreground rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">3</span>
            </div>
            <p className="text-white/90 text-sm sm:text-base">Watch your golf history and handicap grow over time</p>
          </div>
        </div>
      </section>
      
      {/* CTA Reinforcement Strip */}
      <section aria-labelledby="cta-heading" className="w-full py-6 sm:py-8 bg-black/40 backdrop-blur-sm mt-2 sm:mt-3">
        <div className="max-w-5xl mx-auto text-center px-4">
          <h2 id="cta-heading" className="text-xl sm:text-2xl font-bold text-white mb-2">
            Start Tracking Your Golf Scores the Smarter Way
          </h2>
          <p className="text-white/80 text-sm sm:text-base mb-4">
            Join golfers using MyBirdieBoard as their go-to golf score tracker, handicap tracking tool, and performance history archive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" onClick={onStartSignup} data-id="cta_strip_start_free" aria-label="Start free with MyBirdieBoard" className="text-accent-foreground text-base px-8 h-auto py-3 shadow-lg transition-all duration-300 bg-secondary-foreground w-full sm:w-auto">
              <UserPlus className="mr-2 h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm sm:text-base">Start Free</span>
            </Button>
            <Link to="/demo" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="px-8 h-auto py-3 shadow-lg transition-all duration-300 w-full justify-center border-2 border-secondary-foreground/20" aria-label="View demo dashboard">
                <BarChart2 className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="text-sm sm:text-base">Try Demo</span>
              </Button>
            </Link>
            <Link to="/faq" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 px-8 h-auto py-3 shadow-lg transition-all duration-300 w-full" aria-label="View frequently asked questions">
                <HelpCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="text-sm sm:text-base">FAQ</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      
    </div>;
};