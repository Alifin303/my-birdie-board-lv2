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
  // SSG configuration for vite-react-ssg
  // This enables static site generation at build time
  ssgOptions: {
    // Custom function to determine which routes to pre-render
    includedRoutes: () => prerenderRoutes,
    // Script loading strategy for better performance
    script: 'async',
    // Output directory style: /about -> /about/index.html
    dirStyle: 'nested',
    // Mock browser globals during SSG build
    mock: true,
    // Root container selector
    rootContainerId: 'root',
  },
}));
