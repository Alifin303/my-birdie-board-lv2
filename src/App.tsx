
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
import HowItWorks from "@/pages/HowItWorks";
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
                      <title>MyBirdieBoard - Golf Score Tracking & Performance Analytics</title>
                      <meta name="description" content="Track your golf scores, challenge friends on course leaderboards, and improve your game with detailed performance analytics on MyBirdieBoard" />
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
                
                {/* How It Works page */}
                <Route path="/howitworks" element={
                  <HowItWorks />
                } />
                
                {/* Redirect /quiz to root */}
                <Route path="/quiz" element={<Navigate to="/" replace />} />
                
                {/* New routes for courses */}
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:courseId" element={<Course />} />
                
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
