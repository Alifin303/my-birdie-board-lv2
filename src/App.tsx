
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthConfirm } from "./pages/AuthConfirm";
import AuthRedirect from "./pages/AuthRedirect";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<About />} />
      <Route path="/auth/confirm" element={<AuthConfirm />} />
      {/* Add catchall route for Supabase auth redirects */}
      <Route path="/auth/callback" element={<AuthRedirect />} />
      {/* Add root level route to catch redirects to / with code param */}
      <Route path="/" element={<AuthRedirect />}>
        <Route path="?code=*" element={<AuthRedirect />} />
      </Route>
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
