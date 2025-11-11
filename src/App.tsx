
import React from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import About from "@/pages/About";
import Index from "@/pages/Index";
import FAQ from "@/pages/FAQ";
import AuthRedirect from "@/pages/AuthRedirect";
import AuthConfirm from "@/pages/AuthConfirm";
import Checkout from "@/pages/Checkout";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import Admin from "@/pages/Admin";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Course from "@/pages/Course";
import Courses from "@/pages/Courses";
import Blog from "@/pages/Blog";
import GolfScoreTrackingTips from "@/pages/blog/GolfScoreTrackingTips";
import BestGolfClubsBeginners from "@/pages/blog/BestGolfClubsBeginners";
import ImproveGolfSwing from "@/pages/blog/ImproveGolfSwing";
import CourseManagementTips from "@/pages/blog/CourseManagementTips";
import UnderstandingHandicap from "@/pages/blog/UnderstandingHandicap";
import HowToTrackGolfScores from "@/pages/guides/HowToTrackGolfScores";
import GolfHandicapCalculator from "@/pages/guides/GolfHandicapCalculator";
import BestGolfScoreApps from "@/pages/guides/BestGolfScoreApps";
import GolfPerformanceAnalytics from "@/pages/guides/GolfPerformanceAnalytics";
import GolfStatisticsTracker from "@/pages/guides/GolfStatisticsTracker";
import GolfEquipment from "@/pages/GolfEquipment";
import GolfTips from "@/pages/GolfTips";
import GolfLessons from "@/pages/GolfLessons";
import Demo from "@/pages/Demo";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ResetPassword from "@/pages/ResetPassword";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

function App() {
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error initializing auth:", error);
          return;
        }
        
        if (data && data.session) {
          console.log("Session restored successfully");
        }
      } catch (error) {
        console.error("Unexpected error during auth initialization:", error);
      }
    };
    
    initializeAuth();
  }, []);

  return (
    <HelmetProvider>
      <div className="min-h-screen">
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <main className="flex-1">
              <Routes>
                <Route path="/" element={
                  <>
                    <Helmet>
                      <title>MyBirdieBoard - Golf Score Tracking, Analytics & Performance Improvement</title>
                      <meta name="description" content="Track golf scores, analyze performance with golf analytics, calculate handicap, compete on course leaderboards. Golf equipment reviews, tips, lessons & more." />
                      <meta name="keywords" content="golf, golf score tracking, golf analytics, golf equipment, golf tips, golf lessons, golf performance tracking, golf handicap calculator, course leaderboards" />
                      <link rel="canonical" href="https://mybirdieboard.com/" />
                    </Helmet>
                    <Index />
                  </>
                } />
                
                <Route path="/about" element={
                  <>
                    <Helmet>
                      <title>About MyBirdieBoard - Your Ultimate Golf Tracking Solution</title>
                      <meta name="description" content="Learn how MyBirdieBoard helps golfers track scores, analyze performance, and compete on leaderboards to improve their game." />
                      <link rel="canonical" href="https://mybirdieboard.com/about" />
                    </Helmet>
                    <About />
                  </>
                } />
                
                <Route path="/faq" element={
                  <>
                    <Helmet>
                      <title>Frequently Asked Questions | MyBirdieBoard Golf Tracking</title>
                      <meta name="description" content="Find answers to common questions about MyBirdieBoard's golf score tracking, handicap calculations, and performance analytics." />
                      <link rel="canonical" href="https://mybirdieboard.com/faq" />
                    </Helmet>
                    <FAQ />
                  </>
                } />
                
                {/* High-volume keyword landing pages */}
                <Route path="/golf-equipment" element={
                  <>
                    <Helmet>
                      <link rel="canonical" href="https://mybirdieboard.com/golf-equipment" />
                    </Helmet>
                    <GolfEquipment />
                  </>
                } />
                <Route path="/golf-tips" element={
                  <>
                    <Helmet>
                      <link rel="canonical" href="https://mybirdieboard.com/golf-tips" />
                    </Helmet>
                    <GolfTips />
                  </>
                } />
                <Route path="/golf-lessons" element={
                  <>
                    <Helmet>
                      <link rel="canonical" href="https://mybirdieboard.com/golf-lessons" />
                    </Helmet>
                    <GolfLessons />
                  </>
                } />
                
                {/* Blog routes */}
                <Route path="/blog" element={
                  <>
                    <Helmet>
                      <title>Golf Tips & Insights Blog | MyBirdieBoard</title>
                      <meta name="description" content="Expert golf tips, equipment reviews, technique guides, and course management strategies to improve your game." />
                      <link rel="canonical" href="https://mybirdieboard.com/blog" />
                    </Helmet>
                    <Blog />
                  </>
                } />
                <Route path="/blog/golf-score-tracking-tips" element={<GolfScoreTrackingTips />} />
                <Route path="/blog/best-golf-clubs-for-beginners" element={
                  <>
                    <Helmet>
                      <link rel="canonical" href="https://mybirdieboard.com/blog/best-golf-clubs-for-beginners" />
                    </Helmet>
                    <BestGolfClubsBeginners />
                  </>
                } />
                <Route path="/blog/improve-your-golf-swing" element={
                  <>
                    <Helmet>
                      <link rel="canonical" href="https://mybirdieboard.com/blog/improve-your-golf-swing" />
                    </Helmet>
                    <ImproveGolfSwing />
                  </>
                } />
                <Route path="/blog/course-management-tips" element={
                  <>
                    <Helmet>
                      <link rel="canonical" href="https://mybirdieboard.com/blog/course-management-tips" />
                    </Helmet>
                    <CourseManagementTips />
                  </>
                } />
                <Route path="/blog/understanding-golf-handicap-system" element={
                  <>
                    <Helmet>
                      <link rel="canonical" href="https://mybirdieboard.com/blog/understanding-golf-handicap-system" />
                    </Helmet>
                    <UnderstandingHandicap />
                  </>
                } />
                
                {/* Demo route */}
                <Route path="/demo" element={
                  <>
                    <Helmet>
                      <title>Demo Dashboard - Experience MyBirdieBoard Golf Tracking</title>
                      <meta name="description" content="Try MyBirdieBoard's golf tracking features with our interactive demo. See score tracking, analytics, and performance insights in action." />
                      <link rel="canonical" href="https://mybirdieboard.com/demo" />
                    </Helmet>
                    <Demo />
                  </>
                } />
                
                {/* Redirect /quiz to root */}
                <Route path="/quiz" element={<Navigate to="/" replace />} />
                
                {/* New routes for courses */}
                <Route path="/courses" element={
                  <>
                    <Helmet>
                      <link rel="canonical" href="https://mybirdieboard.com/courses" />
                    </Helmet>
                    <Courses />
                  </>
                } />
                <Route path="/courses/:courseId" element={<Course />} />
                
                {/* New SEO-focused guide routes */}
                <Route path="/guides/how-to-track-golf-scores" element={
                  <HowToTrackGolfScores />
                } />
                
                <Route path="/guides/golf-handicap-calculator" element={
                  <GolfHandicapCalculator />
                } />
                
                <Route path="/guides/best-golf-score-tracking-apps" element={
                  <BestGolfScoreApps />
                } />
                
                <Route path="/guides/golf-performance-analytics" element={
                  <GolfPerformanceAnalytics />
                } />
                
                <Route path="/guides/golf-statistics-tracker" element={
                  <GolfStatisticsTracker />
                } />
                
                <Route path="/auth/callback" element={<AuthRedirect />} />
                <Route path="/auth/confirm" element={<AuthConfirm />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                <Route path="/checkout" element={<Checkout />} />
                
                <Route path="/verify" element={<Navigate to="/auth/callback" replace />} />
                <Route path="/auth/v1/verify" element={<Navigate to="/auth/callback" replace />} />
                
                <Route
                  path="/dashboard"
                  element={
                    <>
                      <Helmet>
                        <title>Your Golf Dashboard | MyBirdieBoard</title>
                        <meta name="description" content="View your golf stats, track your progress, and analyze your performance with MyBirdieBoard's comprehensive dashboard." />
                        <link rel="canonical" href="https://mybirdieboard.com/dashboard" />
                      </Helmet>
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    </>
                  }
                />
                
                <Route
                  path="/admin"
                  element={
                    <>
                      <Helmet>
                        <title>Admin Dashboard | MyBirdieBoard</title>
                        <meta name="robots" content="noindex, nofollow" />
                      </Helmet>
                      <Admin />
                    </>
                  }
                />
                
                <Route path="/privacy" element={
                  <>
                    <Helmet>
                      <title>Privacy Policy | MyBirdieBoard</title>
                      <meta name="description" content="MyBirdieBoard's Privacy Policy - Learn how we protect and handle your data" />
                      <link rel="canonical" href="https://mybirdieboard.com/privacy" />
                    </Helmet>
                    <PrivacyPolicy />
                  </>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
        <Toaster />
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 z-50 bg-black/10 p-2 rounded-md text-xs">
            DEV MODE
          </div>
        )}
      </div>
    </HelmetProvider>
  );
}

export default App;
