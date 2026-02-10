
import React from "react";
import { Link } from "react-router-dom";

export const SiteFooter = () => {
  return (
    <footer className="border-t py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Golf Improvement Guides */}
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-foreground">Golf Improvement Guides</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/guides/golf-performance-metrics" className="hover:text-primary transition-colors">Golf Performance Metrics</Link></li>
              <li><Link to="/guides/how-to-improve-at-golf-using-data" className="hover:text-primary transition-colors">Improve Using Data</Link></li>
              <li><Link to="/guides/post-round-golf-analysis" className="hover:text-primary transition-colors">Post-Round Analysis</Link></li>
              <li><Link to="/guides/choosing-the-right-golf-score-tracker" className="hover:text-primary transition-colors">Choosing a Golf Tracker</Link></li>
              <li><Link to="/compare/best-golf-score-tracking-apps" className="hover:text-primary transition-colors">Best Score Tracking Apps</Link></li>
            </ul>
          </div>
          {/* Guides & Resources */}
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-foreground">Guides & Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/guides/how-to-track-golf-scores" className="hover:text-primary transition-colors">How to Track Scores</Link></li>
              <li><Link to="/guides/golf-handicap-calculator" className="hover:text-primary transition-colors">Handicap Calculator</Link></li>
              <li><Link to="/guides/golf-performance-analytics" className="hover:text-primary transition-colors">Performance Analytics</Link></li>
              <li><Link to="/guides/golf-statistics-tracker" className="hover:text-primary transition-colors">Statistics Tracker</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">Golf Blog</Link></li>
            </ul>
          </div>
          {/* Company */}
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-foreground">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t pt-6 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} MyBirdieBoard. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
