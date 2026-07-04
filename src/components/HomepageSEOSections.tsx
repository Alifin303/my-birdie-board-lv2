import { Upload, Award, BarChart2, Trophy, Users, MapPin, Globe2, Route } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/**
 * Keyword-focused SEO content sections for the homepage.
 * These live below the hero and above the existing resources section.
 */
export const HomepageSEOSections = () => {
  return (
    <>
      {/* Section 3 – Keyword-focused intro with internal links */}
      <section aria-labelledby="track-scores-heading" className="py-12 bg-muted/20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 id="track-scores-heading" className="text-3xl font-bold mb-4">
            Track Your Golf Scores Without Using Your Phone on the Course
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            MyBirdieBoard is built for golfers who love traditional play but still want a modern
            digital golf score tracker once the round is over. Learn{' '}
            <Link to="/guides/how-to-track-golf-scores" className="text-primary hover:underline">
              how to track golf scores properly
            </Link>{' '}
            with post-round entry, automatic handicap tracking, and long-term performance
            analysis — all without pulling out your phone mid-round. Discover the{' '}
            <Link to="/guides/golf-performance-metrics" className="text-primary hover:underline">
              golf performance metrics that matter most
            </Link>{' '}
            and learn how{' '}
            <Link to="/guides/post-round-golf-analysis" className="text-primary hover:underline">
              post-round analysis
            </Link>{' '}
            can transform your game. Prefer{' '}
            <Link to="/blog/playing-without-phone" className="text-primary hover:underline">
              playing golf without your phone
            </Link>? That's exactly what we're built for.
          </p>
        </div>
      </section>

      {/* Section 4 – Feature blocks targeting search terms */}
      <section aria-labelledby="features-seo-heading" className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 id="features-seo-heading" className="text-3xl font-bold text-center mb-8">
            Everything You Need in a Golf Score Tracker
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Upload className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
                <h3 className="text-xl font-semibold">Track Golf Scores After Every Round</h3>
              </div>
              <p className="text-muted-foreground">
                Log 9 or 18 hole rounds in seconds and build a complete history of your golf performance.
                Not sure how to keep accurate records? Read our guide on{' '}
                <Link to="/guides/how-to-track-golf-scores" className="text-primary hover:underline">
                  how to track golf scores properly
                </Link>.
              </p>
            </div>
            <div className="p-6 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Award className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
                <h3 className="text-xl font-semibold">Automatic Golf Handicap Tracking</h3>
              </div>
              <p className="text-muted-foreground">
                See your handicap trend over time and measure real improvement.{' '}
                <Link to="/guides/golf-handicap-calculator" className="text-primary hover:underline">
                  Learn how golf handicaps are calculated
                </Link>.
              </p>
            </div>
            <div className="p-6 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <BarChart2 className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
                <h3 className="text-xl font-semibold">Golf Performance Statistics & Trends</h3>
              </div>
              <p className="text-muted-foreground">
                Analyze birdies, pars, scoring averages, and long-term progress.
              </p>
            </div>
            <div className="p-6 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
                <h3 className="text-xl font-semibold">Course Leaderboards & Personal Bests</h3>
              </div>
              <p className="text-muted-foreground">
                Compare rounds, track personal records, and see how you stack up.{' '}
                <Link to="/guides/best-golf-score-tracking-apps" className="text-primary hover:underline">
                  See how we compare to other golf score apps
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 – "Who It's For" */}
      <section aria-labelledby="who-its-for-heading" className="py-12 bg-muted/20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 id="who-its-for-heading" className="text-3xl font-bold mb-6">
            Built for Golfers Who Love the Game, Not Screens
          </h2>
          <ul className="space-y-3 text-lg text-muted-foreground text-left max-w-xl mx-auto">
            <li className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
              <span>Golfers who prefer playing without apps or phones on the course</span>
            </li>
            <li className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
              <span>Players who still use paper scorecards</span>
            </li>
            <li className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
              <span>Anyone who wants a digital golf logbook after the round</span>
            </li>
            <li className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
              <span>Golfers serious about tracking improvement over time</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Section – Golf Course Map (new marketing feature block) */}
      <section aria-labelledby="course-map-heading" className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary mb-3">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                New: Your Golf Course Map
              </div>
              <h2 id="course-map-heading" className="text-3xl font-bold mb-4">
                Every Course You've Ever Played, on One Map
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                Your rounds don't just live in a spreadsheet — they live on a world map. Every time you log a round, MyBirdieBoard drops a pin on the course, building your own personal golf passport as you play.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Look back at the courses you've conquered, the trips you've taken, and the layouts you keep going back to. It's the kind of long-term golf memory a paper scorecard could never keep.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <Globe2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
                  <span className="text-muted-foreground"><strong className="text-foreground">Auto-mapped:</strong> every course you log is pinned automatically — no setup, no manual entry.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Route className="h-5 w-5 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
                  <span className="text-muted-foreground"><strong className="text-foreground">Golf bucket list:</strong> see where you've played and where you still want to go.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Trophy className="h-5 w-5 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
                  <span className="text-muted-foreground"><strong className="text-foreground">Round counts per pin:</strong> spot your home course and your favourites at a glance.</span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/demo"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-medium hover:bg-primary/90 transition-colors"
                >
                  See the map in the demo
                </Link>
                <Link
                  to="/blog/track-golf-courses-played"
                  className="inline-flex items-center gap-2 border border-input px-5 py-2.5 rounded-md font-medium hover:bg-muted transition-colors"
                >
                  Read: Build your golf bucket list
                </Link>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden border bg-muted/30 aspect-[4/3] flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(var(--primary)/0.15),transparent_50%),radial-gradient(circle_at_70%_60%,hsl(var(--primary)/0.1),transparent_50%)]" aria-hidden="true" />
              <div className="relative text-center px-6">
                <Globe2 className="h-16 w-16 text-primary mx-auto mb-4" aria-hidden="true" />
                <p className="font-semibold text-lg mb-1">Your golf passport</p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  A live map of every course you've played, updated automatically with every round.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section – Handicap tracking over time */}
      <section aria-labelledby="handicap-over-time-heading" className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 id="handicap-over-time-heading" className="text-3xl font-bold mb-4">
            Track Your Golf Handicap Over Time
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Your handicap tells the story of your improvement. MyBirdieBoard automatically calculates your golf handicap as you add rounds, showing clear trends over time so you can see how your game is evolving season after season.
          </p>
        </div>
      </section>

      {/* Section – SEO block before FAQ */}
      <section aria-labelledby="serious-golfers-heading" className="py-12 bg-muted/20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 id="serious-golfers-heading" className="text-3xl font-bold mb-4">
            A Golf Score Tracking App Designed for Serious Golfers
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Unlike GPS or on-course apps, MyBirdieBoard is a golf score tracking app built for reflection and improvement after the round. Log your scores, monitor your handicap, and build a lifelong archive of your golf journey without distractions during play.
          </p>
        </div>
      </section>

      {/* FAQ for rich results */}
      <section aria-labelledby="faq-seo-heading" className="py-12 bg-muted/20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 id="faq-seo-heading" className="text-3xl font-bold text-center mb-8">
            Golf Score Tracking FAQs
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="phone">
              <AccordionTrigger className="text-left text-lg font-semibold">
                Can I track golf scores without using my phone during a round?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                Yes — MyBirdieBoard is designed specifically for post-round score entry. Play your round distraction-free, then log your scores in seconds when you're done. No need to carry your phone on the course.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="handicap">
              <AccordionTrigger className="text-left text-lg font-semibold">
                How do I calculate my golf handicap?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                MyBirdieBoard calculates your handicap automatically using the World Handicap System (WHS) formula. Just add your rounds and your handicap index updates after each one.{' '}
                <Link to="/guides/golf-handicap-calculator" className="text-primary hover:underline">
                  Read our full handicap calculation guide
                </Link>{' '}
                or try our{' '}
                <Link to="/tools/handicap-calculator" className="text-primary hover:underline">
                  free WHS handicap calculator
                </Link>
                .
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="performance">
              <AccordionTrigger className="text-left text-lg font-semibold">
                What is the best way to track golf performance over time?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                The best approach is consistent post-round tracking. MyBirdieBoard stores every round, visualizes scoring trends, and highlights where you're{' '}
                <Link to="/guides/golf-performance-analytics" className="text-primary hover:underline">
                  gaining or losing strokes
                </Link>{' '}
                — giving you a clear picture of your progress.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="app">
              <AccordionTrigger className="text-left text-lg font-semibold">
                Is MyBirdieBoard a golf score tracking app?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                Yes — MyBirdieBoard is a golf score tracker, handicap calculator, and performance analytics tool built for golfers who prefer to focus on the game during their round and record everything afterward.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </>
  );
};
