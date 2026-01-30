import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import Prerender from "vite-plugin-prerender";

// Routes to prerender for SEO (public, crawlable pages)
const prerenderRoutes = [
  "/",
  "/about",
  "/faq",
  "/blog",
  "/courses",
  "/privacy",
  "/golf-equipment",
  "/golf-tips",
  "/golf-lessons",
  "/guides/how-to-track-golf-scores",
  "/guides/golf-handicap-calculator",
  "/guides/best-golf-score-tracking-apps",
  "/guides/golf-performance-analytics",
  "/guides/golf-statistics-tracker",
  "/blog/golf-score-tracking-tips",
  "/blog/best-golf-clubs-for-beginners",
  "/blog/improve-your-golf-swing",
  "/blog/course-management-tips",
  "/blog/understanding-golf-handicap-system",
  "/blog/stableford-scoring",
  "/blog/how-to-break-100",
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
    mode === 'production' && Prerender({
      routes: prerenderRoutes,
      staticDir: 'dist',
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
