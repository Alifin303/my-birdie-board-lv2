/**
 * Build-time sitemap generator.
 *
 * Reads the SSG `prerenderRoutes` from vite.config.ts and produces
 * a sitemap.xml string with priority values based on page type.
 *
 * This is invoked as a Vite plugin so the sitemap is always in sync
 * with the route list — no manual editing required.
 */

import type { Plugin } from 'vite';

const SITE_URL = 'https://mybirdieboard.com';

/** High-value educational/stat-focused blog posts get 0.7 */
const HIGH_VALUE_BLOGS = new Set([
  '/blog/how-to-calculate-golf-handicap',
  '/blog/golf-stats-to-track',
  '/blog/understanding-golf-handicap-system',
  '/blog/putts-per-round',
  '/blog/golf-score-tracking-tips',
]);

function getPriority(route: string): string {
  if (route === '/') return '1.0';
  if (route === '/guides') return '0.7';
  if (route.startsWith('/guides/')) return '0.8';
  if (route.startsWith('/compare/')) return '0.8';
  if (HIGH_VALUE_BLOGS.has(route)) return '0.7';
  if (route.startsWith('/blog/')) return '0.6';
  if (route === '/blog') return '0.6';
  if (['/about', '/faq'].includes(route)) return '0.4';
  if (['/courses'].includes(route)) return '0.4';
  if (route === '/privacy') return '0.3';
  return '0.4';
}

function getChangefreq(route: string): string {
  if (route === '/') return 'weekly';
  if (route === '/courses') return 'daily';
  if (route === '/guides') return 'weekly';
  if (route === '/blog') return 'weekly';
  if (route.startsWith('/blog/') || route.startsWith('/guides/') || route.startsWith('/compare/')) return 'monthly';
  return 'monthly';
}

/** Routes that should never appear in the sitemap */
const EXCLUDED = new Set(['/demo']);

export function buildSitemapXML(routes: string[]): string {
  const today = new Date().toISOString().split('T')[0];

  const urls = routes
    .filter((r) => !EXCLUDED.has(r))
    .map((route) => {
      const loc = route === '/' ? SITE_URL + '/' : `${SITE_URL}${route}`;
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${getChangefreq(route)}</changefreq>
    <priority>${getPriority(route)}</priority>
  </url>`;
    });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

/**
 * Vite plugin that writes dist/sitemap.xml after the SSG build finishes.
 * It reads the `prerenderRoutes` array that is passed into it.
 */
export function sitemapPlugin(routes: string[]): Plugin {
  return {
    name: 'generate-sitemap',
    apply: 'build',
    async closeBundle() {
      const { writeFileSync, existsSync, mkdirSync } = await import('fs');
      const { resolve } = await import('path');

      const distDir = resolve(process.cwd(), 'dist');
      if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true });
      }

      const xml = buildSitemapXML(routes);
      writeFileSync(resolve(distDir, 'sitemap.xml'), xml, 'utf-8');
      console.log('✅ sitemap.xml generated with', routes.filter(r => !EXCLUDED.has(r)).length, 'URLs');
    },
  };
}
