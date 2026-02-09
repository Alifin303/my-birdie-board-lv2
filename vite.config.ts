import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { replaceMetaTagsInHTML } from "./src/lib/route-seo-map";
import { sitemapPlugin } from "./src/lib/generate-sitemap";

// List of all public routes to pre-render as static HTML
const prerenderRoutes = [
  '/',
  '/about',
  '/faq',
  '/courses',
  '/blog',
  '/blog/golf-score-tracking-tips',
  '/blog/best-golf-clubs-for-beginners',
  '/blog/improve-your-golf-swing',
  '/blog/course-management-tips',
  '/blog/understanding-golf-handicap-system',
  '/blog/stableford-scoring',
  '/blog/how-to-break-100',
  '/guides/how-to-track-golf-scores',
  '/guides/golf-handicap-calculator',
  '/guides/best-golf-score-tracking-apps',
  '/guides/golf-performance-analytics',
  '/guides/golf-statistics-tracker',
  '/demo',
  '/privacy',
];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'production' && sitemapPlugin(prerenderRoutes),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // SSR configuration
  ssr: {
    noExternal: [],
    external: ['https://cdn.gpteng.co/gptengineer.js'],
  },
  // SSG configuration for vite-react-ssg
  ssgOptions: {
    includedRoutes: () => prerenderRoutes,
    script: 'async',
    dirStyle: 'nested',
    mock: true,
    formatting: 'minify',

    /**
     * Post-render hook: inject route-specific SEO meta tags into <head>.
     *
     * react-helmet-async has a dual-package hazard (CJS vs ESM) that prevents
     * the Head/Helmet component from sharing context with HelmetProvider during SSG.
     * This hook bypasses that by injecting meta tags directly into the HTML string
     * after the page is rendered, ensuring each route gets its own unique
     * <title>, <meta description>, <link rel="canonical">, and OG tags.
     */
    onPageRendered(route: string, html: string) {
      return replaceMetaTagsInHTML(route, html);
    },
  },
}));
