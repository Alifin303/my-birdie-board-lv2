// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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
  ssgOptions: {
    // Add this line to point to your real entry file
    entry: 'src/main.tsx',

    includedRoutes: () => prerenderRoutes,
    script: 'async',
    dirStyle: 'nested',
    mock: true,
    formatting: 'minify',
  },
}));
