/**
 * Route-to-SEO metadata map for SSG build-time injection.
 *
 * During SSG, react-helmet-async's context doesn't propagate reliably
 * due to a dual-package hazard (CJS vs ESM module instances).
 * This map is used by the `onPageRendered` SSG hook in vite.config.ts
 * to inject the correct <title>, <meta>, <link rel="canonical">, and
 * Open Graph tags into each pre-rendered HTML file.
 *
 * IMPORTANT: Keep this map in sync with the SEOHead props in each page component.
 */

const SITE_URL = 'https://mybirdieboard.com';
const OG_IMAGE = `${SITE_URL}/og-image.png`;

interface RouteSEO {
  title: string;
  description: string;
  ogType?: string;
  ogImage?: string;
  keywords?: string;
}

export const routeSEOMap: Record<string, RouteSEO> = {
  // ===== Core pages =====
  '/': {
    title: 'Golf Score Tracker & Handicap Calculator | MyBirdieBoard',
    description: 'Track golf scores, calculate handicap, analyze performance. Free to start with 4 rounds. Join golfers improving their game with MyBirdieBoard.',
    keywords: 'golf score tracking, golf handicap calculator, golf performance analytics, course leaderboards, digital golf scorecard',
  },
  '/about': {
    title: 'About Us - Golf Score Tracking App | MyBirdieBoard',
    description: 'MyBirdieBoard is a distraction-free golf score tracker. Log rounds after you play, track handicap, and compete on course leaderboards.',
    keywords: 'golf score tracking, golf analytics, golf performance tracking, golf handicap, golf statistics tracker',
  },
  '/faq': {
    title: 'Golf Score Tracking FAQ | MyBirdieBoard',
    description: 'Answers to common golf tracking questions. Learn about handicaps, Stableford scoring, subscriptions, and how to add courses.',
    keywords: 'golf FAQ, golf score tracking questions, golf handicap FAQ, MyBirdieBoard help',
  },
  '/courses': {
    title: 'Golf Courses Directory | MyBirdieBoard',
    description: 'Browse golf courses with player stats and leaderboards. Find courses by location and compare your scores with other golfers.',
    keywords: 'golf courses, golf course directory, course leaderboards, golf course stats',
  },
  '/blog': {
    title: 'Golf Blog - Tips, Analytics & Performance Insights | MyBirdieBoard',
    description: 'Expert golf tips, performance analytics insights, and score tracking strategies. Improve your golf game with data-driven advice from MyBirdieBoard\'s golf blog.',
    keywords: 'golf blog, golf tips, golf analytics, golf performance, golf score tracking tips, golf handicap advice',
  },
  '/demo': {
    title: 'Demo Dashboard - See MyBirdieBoard in Action',
    description: 'Experience MyBirdieBoard\'s golf tracking features with our interactive demo. See how easy it is to track scores, analyze performance, and improve your game.',
  },
  '/golf-equipment': {
    title: 'Best Golf Equipment 2025 | MyBirdieBoard',
    description: 'Discover top golf equipment for 2025. GPS watches, clubs, balls, and gear to improve your game. Expert reviews included.',
    keywords: 'golf equipment, golf GPS watches, golf clubs, golf gear 2025',
  },
  '/golf-tips': {
    title: 'Golf Tips to Lower Your Scores | MyBirdieBoard',
    description: 'Expert golf tips for swing, short game, course management, and practice. Data-driven strategies to improve fast.',
    keywords: 'golf tips, golf improvement, golf swing tips, short game tips, course management',
  },
  '/golf-lessons': {
    title: 'Find Golf Lessons Near You | MyBirdieBoard',
    description: 'Find golf lessons and professional instruction. Private lessons, group classes, online coaching, and golf clinics.',
    keywords: 'golf lessons, golf instruction, golf coaching, golf clinics',
  },
  '/privacy': {
    title: 'Privacy Policy - How MyBirdieBoard Protects Your Golf Data | MyBirdieBoard',
    description: 'Read MyBirdieBoard\'s Privacy Policy. Learn how we collect, protect, and handle your golf scores, account information, and personal data. Your privacy matters to us.',
    keywords: 'MyBirdieBoard privacy policy, golf app privacy, golf data protection, user data security',
  },

  // ===== Blog posts =====
  '/blog/golf-score-tracking-tips': {
    title: '10 Essential Golf Score Tracking Tips for Better Performance | MyBirdieBoard',
    description: 'Master golf score tracking with these 10 proven tips. Learn professional techniques to improve your game through better data collection and analysis.',
    keywords: 'golf score tracking tips, golf performance tracking, digital golf scorecard, golf statistics, golf improvement',
    ogType: 'article',
  },
  '/blog/best-golf-clubs-for-beginners': {
    title: 'Best Golf Clubs for Beginners 2025 - Complete Buying Guide | MyBirdieBoard',
    description: 'Discover the best golf clubs for beginners in 2025. Expert recommendations on drivers, irons, putters, and complete sets to start your golf journey right.',
    keywords: 'best golf clubs for beginners, beginner golf clubs, golf equipment, golf club sets, starter golf clubs',
    ogType: 'article',
  },
  '/blog/improve-your-golf-swing': {
    title: 'How to Improve Your Golf Swing - 10 Proven Tips for Better Performance | MyBirdieBoard',
    description: 'Fix common swing faults like slicing and hooking with 10 expert tips. Master grip, posture, rotation, and follow-through to hit more fairways and lower scores.',
    keywords: 'improve golf swing, golf swing tips, golf technique, better golf swing, golf fundamentals',
    ogType: 'article',
  },
  '/blog/course-management-tips': {
    title: 'Golf Course Management: Strategy Tips to Lower Your Score | MyBirdieBoard',
    description: 'Master golf course management with these strategic tips. Learn when to be aggressive, how to avoid big numbers, and make smarter decisions on the course.',
    keywords: 'golf course management, golf strategy, course management tips, smart golf, golf tactics',
    ogType: 'article',
  },
  '/blog/understanding-golf-handicap-system': {
    title: 'Understanding Golf Handicap System - Complete Guide 2026 | MyBirdieBoard',
    description: 'Complete guide to the World Handicap System (WHS). Understand slope ratings, course handicaps, score differentials, and how to establish your first handicap index.',
    keywords: 'golf handicap, handicap system, calculate golf handicap, handicap index, WHS, World Handicap System',
    ogType: 'article',
  },
  '/blog/stableford-scoring': {
    title: 'What is Stableford Scoring in Golf? Complete Guide & Calculator | MyBirdieBoard',
    description: 'Learn how Stableford scoring works in golf, how to calculate points for each hole, and why it\'s a popular alternative to stroke play. Track Stableford scores with MyBirdieBoard.',
    keywords: 'stableford scoring, stableford points, golf stableford, stableford calculator, stableford scoring system',
    ogType: 'article',
  },
  '/blog/how-to-break-100': {
    title: 'How to Break 100 in Golf: 15 Proven Tips for Beginners | MyBirdieBoard',
    description: 'Learn how to break 100 in golf with 15 proven tips. From course management to avoiding big numbers, discover strategies to help you shoot in the 90s.',
    keywords: 'how to break 100 in golf, break 100, golf tips for beginners, golf scoring tips',
    ogType: 'article',
  },
  '/blog/match-play-scoring': {
    title: 'How to Keep Score in Match Play Golf | MyBirdieBoard',
    description: 'Learn how to keep score in match play golf. Understand holes up/down, dormie, concessions, handicap strokes, and all the rules for match play scoring.',
    keywords: 'match play scoring, how to keep score match play, match play golf rules, match play vs stroke play, dormie, golf match play',
    ogType: 'article',
  },
  '/blog/putts-per-round': {
    title: 'How Many Putts Per Round is Good? Putting Stats by Handicap | MyBirdieBoard',
    description: 'Find out how many putts per round is good for your skill level. Putting averages by handicap, PGA Tour benchmarks, and tips to lower your putts per round.',
    keywords: 'putts per round, how many putts per round is good, putting average, putting stats, putts per GIR, golf putting statistics',
    ogType: 'article',
  },
  '/blog/how-to-calculate-golf-handicap': {
    title: 'How to Calculate Golf Handicap: Beginner\'s Guide | MyBirdieBoard',
    description: 'Learn how to calculate your golf handicap step by step. A simple beginner-friendly guide to the World Handicap System, score differentials, and handicap index.',
    keywords: 'how to calculate golf handicap, golf handicap for beginners, handicap index, score differential, World Handicap System',
    ogType: 'article',
  },
  '/blog/golf-stats-to-track': {
    title: 'Golf Stats You Should Track to Improve | MyBirdieBoard',
    description: 'Discover the most important golf statistics to track. From fairways hit to putts per round, learn which stats reveal where you\'re losing strokes.',
    keywords: 'golf stats to track, golf statistics, fairways in regulation, greens in regulation, putts per round, golf analytics',
    ogType: 'article',
  },
  '/blog/playing-without-phone': {
    title: 'Why Playing Golf Without Your Phone Might Be the Best Decision You Make | MyBirdieBoard',
    description: 'Discover why keeping your phone in the bag during a round leads to better focus, lower scores, and more enjoyment.',
    keywords: 'golf without phone, golf focus, golf mental game, distraction free golf, post round tracking, golf flow state',
    ogType: 'article',
  },

  // ===== Guide pages =====
  '/guides/how-to-track-golf-scores': {
    title: 'How to Track Golf Scores | MyBirdieBoard',
    description: 'Learn how to track golf scores effectively. Digital tools, apps, and best practices for beginners and pros.',
    keywords: 'how to track golf scores, golf score tracking, golf scorecard, digital golf scorecard',
    ogType: 'article',
  },
  '/guides/golf-handicap-calculator': {
    title: 'Golf Handicap Calculator Guide | MyBirdieBoard',
    description: 'Learn how to calculate your golf handicap step by step using the official WHS method. Free handicap tracking.',
    keywords: 'golf handicap calculator, how to calculate golf handicap, WHS handicap, handicap index',
    ogType: 'article',
  },
  '/guides/best-golf-score-tracking-apps': {
    title: 'Best Golf Score Apps 2025 | MyBirdieBoard',
    description: 'Compare the best golf score tracking apps. Features, pricing, and which app is right for your game.',
    keywords: 'best golf score apps, golf score tracking apps, golf apps 2025, golf handicap apps',
    ogType: 'article',
  },
  '/guides/golf-performance-analytics': {
    title: 'Golf Performance Analytics Guide | MyBirdieBoard',
    description: 'Use data to improve your golf game. Learn to analyze stats, identify weaknesses, and track progress.',
    keywords: 'golf performance analytics, golf statistics, strokes gained, golf improvement, golf metrics',
    ogType: 'article',
  },
  '/guides/golf-statistics-tracker': {
    title: 'Golf Statistics Tracker Guide | MyBirdieBoard',
    description: 'Track key golf statistics to improve your game. Fairways, greens in regulation, putts, and more.',
    keywords: 'golf statistics tracker, golf stats, golf metrics, golf performance stats',
    ogType: 'article',
  },
};

/**
 * Generate the full HTML meta tag string for a given route path.
 * Used by the SSG `onPageRendered` hook to inject into <head>.
 */
export function generateMetaTagsHTML(routePath: string): string {
  // Normalize: strip trailing slashes (except root) before lookup
  const normalized = routePath === '/' ? '/' : routePath.replace(/\/+$/, '');
  const seo = routeSEOMap[normalized];
  if (!seo) return '';

  const normalizedPath = normalized === '/' ? '/' : normalized.replace(/\/+$/, '');
  const canonicalUrl = `${SITE_URL}${normalizedPath}`;
  const ogType = seo.ogType || 'website';
  const ogImage = seo.ogImage || OG_IMAGE;

  const tags: string[] = [
    `<title>${seo.title}</title>`,
    `<meta name="description" content="${seo.description}">`,
    `<link rel="canonical" href="${canonicalUrl}">`,
    `<meta property="og:title" content="${seo.title}">`,
    `<meta property="og:description" content="${seo.description}">`,
    `<meta property="og:url" content="${canonicalUrl}">`,
    `<meta property="og:type" content="${ogType}">`,
    `<meta property="og:image" content="${ogImage}">`,
    `<meta property="og:image:alt" content="${seo.title}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${seo.title}">`,
    `<meta name="twitter:description" content="${seo.description}">`,
    `<meta name="twitter:image" content="${ogImage}">`,
    `<meta name="twitter:image:alt" content="${seo.title}">`,
  ];

  if (seo.keywords) {
    tags.push(`<meta name="keywords" content="${seo.keywords}">`);
  }

  return tags.join('\n    ');
}

/**
 * Strip any existing SEO tags from the HTML that would conflict with
 * route-specific tags, then inject the correct ones.
 * This ensures there are never duplicate <title>, description, or OG tags.
 *
 * IMPORTANT: jsdom (used by vite-react-ssg) may reorder HTML attributes,
 * so all regex patterns must be attribute-order-independent.
 */
export function replaceMetaTagsInHTML(routePath: string, html: string): string {
  const metaTags = generateMetaTagsHTML(routePath);
  if (!metaTags) return html;

  let cleaned = html;

  // Remove any existing <title>...</title> (including those with data-rh or other attributes)
  cleaned = cleaned.replace(/<title[^>]*>[^<]*<\/title>/gi, '');

  // Remove existing meta tags we control (name="...")
  // Match <meta ...name="X"...> regardless of attribute order
  const metaNamesToRemove = [
    'description', 'keywords', 'twitter\\:card', 'twitter\\:title',
    'twitter\\:description', 'twitter\\:image', 'twitter\\:image\\:alt',
  ];
  for (const name of metaNamesToRemove) {
    cleaned = cleaned.replace(
      new RegExp(`<meta\\s[^>]*name=["']${name}["'][^>]*\\/?>`, 'gi'),
      ''
    );
  }

  // Remove existing OG property tags we control
  // Match <meta ...property="og:X"...> regardless of attribute order
  const ogPropsToRemove = [
    'og\\:title', 'og\\:description', 'og\\:url', 'og\\:type',
    'og\\:image', 'og\\:image\\:alt', 'article\\:modified_time',
  ];
  for (const prop of ogPropsToRemove) {
    cleaned = cleaned.replace(
      new RegExp(`<meta\\s[^>]*property=["']${prop}["'][^>]*\\/?>`, 'gi'),
      ''
    );
  }

  // Remove existing canonical link (attribute-order-independent)
  cleaned = cleaned.replace(/<link\s[^>]*rel=["']canonical["'][^>]*\/?>/gi, '');

  // Inject route-specific tags after <head>
  cleaned = cleaned.replace(/<head[^>]*>/i, (match) => `${match}\n    ${metaTags}`);

  return cleaned;
}
