import { Link } from "react-router-dom";

interface RelatedGuide {
  to: string;
  label: string;
}

/**
 * Map of guide paths to their related guides for cross-linking.
 */
const GUIDE_CROSS_LINKS: Record<string, RelatedGuide[]> = {
  '/guides/how-to-track-golf-scores': [
    { to: '/guides/golf-handicap-calculator', label: 'Golf Handicap Calculator Guide' },
    { to: '/guides/golf-performance-analytics', label: 'Golf Performance Analytics' },
    { to: '/guides/golf-performance-metrics', label: 'The Ultimate Guide to Golf Performance Metrics' },
  ],
  '/guides/golf-handicap-calculator': [
    { to: '/guides/how-to-track-golf-scores', label: 'How to Track Golf Scores' },
    { to: '/guides/golf-statistics-tracker', label: 'Golf Statistics Tracker' },
    { to: '/guides/how-to-improve-at-golf-using-data', label: 'How to Improve Using Data' },
  ],
  '/guides/best-golf-score-tracking-apps': [
    { to: '/guides/how-to-track-golf-scores', label: 'How to Track Golf Scores' },
    { to: '/guides/choosing-the-right-golf-score-tracker', label: 'Choosing the Right Golf Score Tracker' },
    { to: '/compare/best-golf-score-tracking-apps', label: 'Best Golf Score Tracking Apps Comparison' },
  ],
  '/guides/golf-performance-analytics': [
    { to: '/guides/golf-statistics-tracker', label: 'Golf Statistics Tracker' },
    { to: '/guides/golf-performance-metrics', label: 'The Ultimate Guide to Golf Performance Metrics' },
    { to: '/guides/post-round-golf-analysis', label: 'Post-Round Golf Analysis' },
  ],
  '/guides/golf-statistics-tracker': [
    { to: '/guides/golf-performance-analytics', label: 'Golf Performance Analytics' },
    { to: '/guides/golf-performance-metrics', label: 'Golf Performance Metrics' },
    { to: '/guides/how-to-improve-at-golf-using-data', label: 'Improve Your Game Using Data' },
  ],
  '/guides/golf-performance-metrics': [
    { to: '/guides/golf-performance-analytics', label: 'Golf Performance Analytics' },
    { to: '/guides/how-to-improve-at-golf-using-data', label: 'Improve Your Game Using Data' },
    { to: '/guides/post-round-golf-analysis', label: 'Post-Round Golf Analysis' },
  ],
  '/guides/how-to-improve-at-golf-using-data': [
    { to: '/guides/golf-performance-metrics', label: 'Golf Performance Metrics' },
    { to: '/guides/post-round-golf-analysis', label: 'Post-Round Golf Analysis' },
    { to: '/guides/golf-statistics-tracker', label: 'Golf Statistics Tracker' },
  ],
  '/guides/post-round-golf-analysis': [
    { to: '/guides/how-to-improve-at-golf-using-data', label: 'Improve Your Game Using Data' },
    { to: '/guides/golf-performance-metrics', label: 'Golf Performance Metrics' },
    { to: '/guides/choosing-the-right-golf-score-tracker', label: 'Choosing the Right Golf Score Tracker' },
  ],
  '/guides/choosing-the-right-golf-score-tracker': [
    { to: '/compare/best-golf-score-tracking-apps', label: 'Best Golf Score Tracking Apps' },
    { to: '/guides/post-round-golf-analysis', label: 'Post-Round Golf Analysis' },
    { to: '/guides/how-to-improve-at-golf-using-data', label: 'Improve Your Game Using Data' },
  ],
  '/compare/best-golf-score-tracking-apps': [
    { to: '/guides/choosing-the-right-golf-score-tracker', label: 'Choosing the Right Golf Score Tracker' },
    { to: '/guides/golf-performance-metrics', label: 'Golf Performance Metrics' },
    { to: '/guides/post-round-golf-analysis', label: 'Post-Round Golf Analysis' },
  ],
};

/**
 * Related guides cross-linking section for guide pages.
 * Automatically picks related guides based on the current path.
 */
export const RelatedGuides = ({ currentPath }: { currentPath: string }) => {
  const normalized = currentPath.replace(/\/+$/, '');
  const links = GUIDE_CROSS_LINKS[normalized];

  if (!links || links.length === 0) return null;

  return (
    <div className="mt-8 border-t pt-8">
      <h3 className="text-xl font-semibold mb-4">Related Golf Performance Guides</h3>
      <ul className="space-y-2 text-sm">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="text-primary hover:underline">
              → {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
