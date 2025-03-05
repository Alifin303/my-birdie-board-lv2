
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";
import AuthRedirect from "@/pages/AuthRedirect";
import AuthConfirm from "@/pages/AuthConfirm";
import Quiz from "@/pages/Quiz";
import Checkout from "@/pages/Checkout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ApiTest from "@/pages/ApiTest";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/api-test" element={<ApiTest />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requireSubscription={true}>
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
    </QueryClientProvider>
  );
}

export default App;
