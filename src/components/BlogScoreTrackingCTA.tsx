import { Link } from "react-router-dom";

/**
 * Reusable CTA + internal links block for blog posts.
 * Adds "Improve Your Game with Better Score Tracking" with guide links.
 */
export const BlogScoreTrackingCTA = () => (
  <div className="mt-12 not-prose border-t pt-8">
    <h3 className="text-xl font-semibold mb-4">Improve Your Game with Better Score Tracking</h3>
    <p className="text-muted-foreground mb-4">
      Track every round, monitor your handicap, and see where your game is improving with MyBirdieBoard.
    </p>
    <ul className="space-y-2 text-sm mb-6">
      <li>
        <Link to="/guides/how-to-track-golf-scores" className="text-primary hover:underline">
          → How to Track Golf Scores Effectively
        </Link>
      </li>
      <li>
        <Link to="/guides/golf-handicap-calculator" className="text-primary hover:underline">
          → Golf Handicap Calculator Guide
        </Link>
      </li>
      <li>
        <Link to="/guides/golf-performance-metrics" className="text-primary hover:underline">
          → The Ultimate Guide to Golf Performance Metrics
        </Link>
      </li>
      <li>
        <Link to="/guides/post-round-golf-analysis" className="text-primary hover:underline">
          → Post-Round Golf Analysis Guide
        </Link>
      </li>
    </ul>
  </div>
);
