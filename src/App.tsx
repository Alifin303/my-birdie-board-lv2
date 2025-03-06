
import React from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import About from "@/pages/About";
import Index from "@/pages/Index";
import Quiz from "@/pages/Quiz";
import AuthRedirect from "@/pages/AuthRedirect";
import AuthConfirm from "@/pages/AuthConfirm";
import Checkout from "@/pages/Checkout";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ResetPassword from "@/pages/ResetPassword";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

function App() {
  // Setup persistence enhancement for Supabase auth
  useEffect(() => {
    // Try to restore session on app load
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
    <div className="min-h-screen">
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/auth/callback" element={<AuthRedirect />} />
              <Route path="/auth/confirm" element={<AuthConfirm />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/checkout" element={<Checkout />} />
              
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              
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
  );
}

export default App;
