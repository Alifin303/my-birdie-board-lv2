import React, { useState } from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { About } from "@/pages/About";
import Index from "@/pages/Index";
import Quiz from "@/pages/Quiz";
import AuthRedirect from "@/pages/AuthRedirect";
import AuthConfirm from "@/pages/AuthConfirm";
import Checkout from "@/pages/Checkout";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import CourseDetails from "@/pages/CourseDetails";
import RoundDetails from "@/pages/RoundDetails";
import { Toaster } from "@/components/ui/toaster";
import { useUser } from "@supabase/auth-helpers-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ThemeProvider } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ModeToggle";
import { UserDebugPanel } from "@/components/UserDebugPanel";

// Add the new import for the ResetPassword component
import ResetPassword from "@/pages/ResetPassword";

function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const user = useUser();

  return (
    <div className="min-h-screen">
      <BrowserRouter>
        <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
          <div className="flex flex-col min-h-screen">
            <SiteHeader />
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
                <Route
                  path="/courses/:courseId"
                  element={
                    <ProtectedRoute>
                      <CourseDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rounds/:roundId"
                  element={
                    <ProtectedRoute>
                      <RoundDetails />
                    </ProtectedRoute>
                  }
                />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </BrowserRouter>
      <Toaster />
      {/* Conditionally render UserDebugPanel based on environment */}
      {process.env.NODE_ENV === 'development' && <UserDebugPanel />}
    </div>
  );
}

export default App;
