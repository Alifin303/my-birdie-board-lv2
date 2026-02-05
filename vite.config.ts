import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// List of all public routes to pre-render as static HTML
// These routes will have their full content rendered into HTML at build time
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
  '/golf-equipment',
  '/golf-tips',
  '/golf-lessons',
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
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // SSR configuration - exclude external CDN scripts from server bundle
  ssr: {
    noExternal: [],
    external: ['https://cdn.gpteng.co/gptengineer.js'],
  },
  // SSG configuration for vite-react-ssg
  // IMPORTANT: Run with "vite-react-ssg build" not "vite build"
  ssgOptions: {
    // Routes to pre-render at build time
    includedRoutes: () => prerenderRoutes,
    // Script loading strategy
    script: 'async',
    // Output as /about/index.html style
    dirStyle: 'nested',
    // Mock browser globals during SSG
    mock: true,
    // Formatting for readable HTML output
    formatting: 'minify',
  },
  // Build optimization - note: manualChunks removed as it conflicts with SSR build
  // vite-react-ssg handles chunking automatically
}));
