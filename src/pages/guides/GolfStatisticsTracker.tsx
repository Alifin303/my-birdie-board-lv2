
import { GuideLayout } from "@/components/guides/GuideLayout";
import { Link } from "react-router-dom";

const GolfStatisticsTracker = () => {
  return (
    <GuideLayout
      title="Golf Statistics Tracker Guide | MyBirdieBoard"
      description="Track key golf statistics to improve your game. Fairways, greens in regulation, putts, and more."
      canonicalUrl="https://mybirdieboard.com/guides/golf-statistics-tracker"
      keywords="golf statistics tracker, golf stats, golf metrics, golf performance stats"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Why Track Golf Statistics?</h2>
          <p className="text-muted-foreground mb-4">
            Golf statistics provide objective insights into your performance, helping you identify 
            strengths and weaknesses that might not be obvious from just looking at your scores. 
            By tracking the right metrics, you can make targeted improvements that lead to lower scores.
          </p>
          <p className="text-muted-foreground mb-4">
            Professional golfers rely heavily on statistics to guide their practice and course 
            management decisions. Amateur golfers can benefit from the same data-driven approach 
            to improvement.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Essential Golf Statistics for Every Golfer</h2>
          
          <h3 className="text-xl font-semibold mb-3">Scoring Statistics</h3>
          <div className="space-y-4 mb-6">
            <div>
              <h4 className="font-semibold mb-2">Gross Score</h4>
              <p className="text-muted-foreground">Your total strokes for the round, the most basic but important statistic.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Net Score</h4>
              <p className="text-muted-foreground">Your score after applying your handicap, useful for comparing with golfers of different abilities.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Score vs Par</h4>
              <p className="text-muted-foreground">How many strokes over or under par you shot, normalized across different courses.</p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-3">Driving Statistics</h3>
          <div className="space-y-4 mb-6">
            <div>
              <h4 className="font-semibold mb-2">Fairways Hit</h4>
              <p className="text-muted-foreground">Percentage of tee shots that land in the fairway. Typical amateur average: 50-60%</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Driving Distance</h4>
              <p className="text-muted-foreground">Average distance of your drives, measured from tee to final resting position.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Driving Accuracy</h4>
              <p className="text-muted-foreground">Combination of distance and accuracy that measures overall driving effectiveness.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Iron Play and Approach Statistics</h2>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Greens in Regulation (GIR)</h4>
              <p className="text-muted-foreground mb-2">
                Percentage of holes where you reach the green in regulation (2 shots on par 4s, 
                3 shots on par 5s, 1 shot on par 3s).
              </p>
              <p className="text-muted-foreground">Average amateur GIR: 20-40%, Scratch golfer: 65-70%</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Proximity to Pin</h4>
              <p className="text-muted-foreground">Average distance from the pin on approach shots that hit the green.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Approach Shot Accuracy</h4>
              <p className="text-muted-foreground">Percentage of approach shots that land on the green from various distances.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Short Game Statistics</h2>
          
          <h3 className="text-xl font-semibold mb-3">Around the Green</h3>
          <div className="space-y-4 mb-6">
            <div>
              <h4 className="font-semibold mb-2">Up and Down Percentage</h4>
              <p className="text-muted-foreground">
                Percentage of times you make par or better after missing the green in regulation. 
                This measures your short game effectiveness.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Scrambling</h4>
              <p className="text-muted-foreground">
                Making par or better after missing the green in regulation. Similar to up and down 
                but includes all missed greens, not just those close to the green.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Sand Save Percentage</h4>
              <p className="text-muted-foreground">Percentage of times you make par or better from greenside bunkers.</p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-3">Putting Statistics</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Putts per Round</h4>
              <p className="text-muted-foreground">Total putts taken during the round. Average amateur: 32-36 putts</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Putts per GIR</h4>
              <p className="text-muted-foreground">Average putts on greens hit in regulation, measuring putting efficiency.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Three-Putt Avoidance</h4>
              <p className="text-muted-foreground">Percentage of holes completed with 2 putts or fewer.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">One-Putt Percentage</h4>
              <p className="text-muted-foreground">Percentage of holes completed with just one putt.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Advanced Statistical Analysis</h2>
          
          <h3 className="text-xl font-semibold mb-3">Trends and Patterns</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
            <li>Performance improvement over time</li>
            <li>Seasonal variations in your game</li>
            <li>Course-specific performance patterns</li>
            <li>Weather condition impacts</li>
            <li>Round-to-round consistency</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">Correlation Analysis</h3>
          <p className="text-muted-foreground mb-4">
            Understanding which statistics correlate most strongly with lower scores:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Putting typically has the highest correlation with scoring</li>
            <li>GIR percentage strongly predicts scoring ability</li>
            <li>Short game performance impacts score more than driving distance</li>
            <li>Three-putt avoidance is crucial for consistent scoring</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">How to Collect Golf Statistics</h2>
          
          <h3 className="text-xl font-semibold mb-3">During Your Round</h3>
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground mb-6">
            <li>Record basic score for each hole immediately</li>
            <li>Track putts taken on each green</li>
            <li>Note fairways hit and missed</li>
            <li>Record whether you hit greens in regulation</li>
            <li>Track up and down attempts and successes</li>
            <li>Make notes about significant shots or situations</li>
          </ol>

          <h3 className="text-xl font-semibold mb-3">Digital vs Manual Tracking</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Digital Tracking Benefits</h4>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Automatic calculations</li>
                <li>Trend analysis and charts</li>
                <li>Easy data storage and retrieval</li>
                <li>Comparison with benchmarks</li>
                <li>Integration with other features</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Manual Tracking Benefits</h4>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>No battery concerns</li>
                <li>Tactile engagement with data</li>
                <li>Customizable format</li>
                <li>No technology distractions</li>
                <li>Always available</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Using Statistics for Improvement</h2>
          
          <h3 className="text-xl font-semibold mb-3">Identifying Priority Areas</h3>
          <p className="text-muted-foreground mb-4">
            Use the "biggest bang for your buck" principle to focus improvement efforts:
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground mb-6">
            <li>Calculate how many strokes each statistical category costs you per round</li>
            <li>Identify which improvements would save the most strokes</li>
            <li>Focus practice time on your biggest weakness</li>
            <li>Set specific, measurable goals for improvement</li>
          </ol>

          <h3 className="text-xl font-semibold mb-3">Setting Realistic Goals</h3>
          <div className="bg-muted p-6 rounded-lg">
            <h4 className="font-semibold mb-3">Example Statistical Goals:</h4>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Reduce three-putts from 4 per round to 2 per round</li>
              <li>Improve GIR percentage from 25% to 35%</li>
              <li>Increase up and down percentage from 30% to 45%</li>
              <li>Reduce putts per round from 34 to 31</li>
              <li>Improve fairway accuracy from 50% to 60%</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">MyBirdieBoard Statistical Features</h2>
          
          <p className="text-muted-foreground mb-4">
            MyBirdieBoard automatically tracks and analyzes key golf statistics:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
            <li>Comprehensive scoring statistics and trends</li>
            <li>Course-specific performance analysis</li>
            <li>Handicap progression and calculation</li>
            <li>Round comparison and improvement tracking</li>
            <li>Visual charts showing performance over time</li>
            <li>Leaderboard comparisons with other golfers</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">Getting Started</h3>
          <p className="text-muted-foreground mb-4">
            Start tracking your golf statistics today with MyBirdieBoard's{' '}
            <Link to="/" className="text-primary hover:underline">golf score tracker</Link>.
            Focus on consistent data collection, and let the insights guide your 
            improvement journey.
          </p>
        </section>
      </div>
    </GuideLayout>
  );
};

export default GolfStatisticsTracker;
