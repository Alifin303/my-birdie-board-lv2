
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";
import AuthRedirect from "@/pages/AuthRedirect";
import AuthConfirm from "@/pages/AuthConfirm";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ApiTest from "@/pages/ApiTest";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/api-test" element={<ApiTest />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/auth-redirect" element={<AuthRedirect />} />
        <Route path="?code=*" element={<AuthConfirm />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
