import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

/**
 * Dynamic sitemap edge function.
 * Kept as a fallback / supplement to the static sitemap.xml generated at build time.
 */

const SITE_URL = 'https://mybirdieboard.com';

const routes: { path: string; priority: string; changefreq: string }[] = [
  // Core
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/about', priority: '0.4', changefreq: 'monthly' },
  { path: '/faq', priority: '0.4', changefreq: 'monthly' },
  { path: '/courses', priority: '0.4', changefreq: 'daily' },
  { path: '/privacy', priority: '0.2', changefreq: 'yearly' },

  // Blog
  { path: '/blog', priority: '0.6', changefreq: 'weekly' },
  { path: '/blog/golf-score-tracking-tips', priority: '0.6', changefreq: 'monthly' },
  { path: '/blog/best-golf-clubs-for-beginners', priority: '0.6', changefreq: 'monthly' },
  { path: '/blog/improve-your-golf-swing', priority: '0.6', changefreq: 'monthly' },
  { path: '/blog/course-management-tips', priority: '0.6', changefreq: 'monthly' },
  { path: '/blog/understanding-golf-handicap-system', priority: '0.6', changefreq: 'monthly' },
  { path: '/blog/stableford-scoring', priority: '0.6', changefreq: 'monthly' },
  { path: '/blog/how-to-break-100', priority: '0.6', changefreq: 'monthly' },
  { path: '/blog/match-play-scoring', priority: '0.6', changefreq: 'monthly' },
  { path: '/blog/putts-per-round', priority: '0.6', changefreq: 'monthly' },
  { path: '/blog/how-to-calculate-golf-handicap', priority: '0.6', changefreq: 'monthly' },
  { path: '/blog/golf-stats-to-track', priority: '0.6', changefreq: 'monthly' },
  { path: '/blog/playing-without-phone', priority: '0.6', changefreq: 'monthly' },

  // Guides
  { path: '/guides/how-to-track-golf-scores', priority: '0.8', changefreq: 'monthly' },
  { path: '/guides/golf-handicap-calculator', priority: '0.8', changefreq: 'monthly' },
  { path: '/guides/best-golf-score-tracking-apps', priority: '0.8', changefreq: 'monthly' },
  { path: '/guides/golf-performance-analytics', priority: '0.8', changefreq: 'monthly' },
  { path: '/guides/golf-statistics-tracker', priority: '0.8', changefreq: 'monthly' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const currentDate = new Date().toISOString().split('T')[0];

    const urls = routes.map(r => {
      const loc = r.path === '/' ? `${SITE_URL}/` : `${SITE_URL}${r.path}`;
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`;
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

    return new Response(sitemap, { headers: corsHeaders });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate sitemap' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
