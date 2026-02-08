import { Upload, Award, BarChart2, Trophy, Users } from 'lucide-react';

/**
 * Keyword-focused SEO content sections for the homepage.
 * These live below the hero and above the existing resources section.
 */
export const HomepageSEOSections = () => {
  return (
    <>
      {/* Section 3 – Keyword-focused intro */}
      <section aria-labelledby="track-scores-heading" className="py-12 bg-muted/20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 id="track-scores-heading" className="text-3xl font-bold mb-4">
            Track Your Golf Scores Without Using Your Phone on the Course
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            MyBirdieBoard is built for golfers who love traditional play but still want a modern
            digital golf score tracker once the round is over. Enter your scores after you play,
            track your handicap automatically, and build a long-term record of your performance —
            all without pulling out your phone mid-round.
          </p>
        </div>
      </section>

      {/* Section 4 – Feature blocks targeting search terms */}
      <section aria-labelledby="features-seo-heading" className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 id="features-seo-heading" className="text-3xl font-bold text-center mb-8">
            Everything You Need in a Golf Score Tracking App
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Upload className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
                <h3 className="text-xl font-semibold">Track Golf Scores After Every Round</h3>
              </div>
              <p className="text-muted-foreground">
                Log 9 or 18 hole rounds in seconds and build a complete history of your golf performance.
              </p>
            </div>
            <div className="p-6 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Award className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
                <h3 className="text-xl font-semibold">Automatic Golf Handicap Tracking</h3>
              </div>
              <p className="text-muted-foreground">
                See your handicap trend over time and measure real improvement.
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
                Compare rounds, track personal records, and see how you stack up.
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
    </>
  );
};
