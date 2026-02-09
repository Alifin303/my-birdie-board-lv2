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
  ],
  '/guides/golf-handicap-calculator': [
    { to: '/guides/how-to-track-golf-scores', label: 'How to Track Golf Scores' },
    { to: '/guides/golf-statistics-tracker', label: 'Golf Statistics Tracker' },
  ],
  '/guides/best-golf-score-tracking-apps': [
    { to: '/guides/how-to-track-golf-scores', label: 'How to Track Golf Scores' },
    { to: '/guides/golf-performance-analytics', label: 'Golf Performance Analytics' },
  ],
  '/guides/golf-performance-analytics': [
    { to: '/guides/golf-statistics-tracker', label: 'Golf Statistics Tracker' },
    { to: '/guides/golf-handicap-calculator', label: 'Golf Handicap Calculator Guide' },
  ],
  '/guides/golf-statistics-tracker': [
    { to: '/guides/golf-performance-analytics', label: 'Golf Performance Analytics' },
    { to: '/guides/how-to-track-golf-scores', label: 'How to Track Golf Scores' },
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
