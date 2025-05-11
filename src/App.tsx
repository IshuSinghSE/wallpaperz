
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "./pages/NotFound";

// Dashboard Components
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Dashboard from "@/pages/dashboard/Dashboard";
import WallpaperList from "@/pages/dashboard/WallpaperList";
import WallpaperUpload from "@/pages/dashboard/WallpaperUpload";

// Auth Pages
import Login from "@/pages/Login";
import Unauthorized from "@/pages/Unauthorized";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected dashboard routes */}
            <Route element={<ProtectedRoute requireAdmin={true} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/wallpapers" element={<WallpaperList />} />
                <Route path="/dashboard/upload" element={<WallpaperUpload />} />
                {/* Add other dashboard routes as they are developed */}
                <Route path="/dashboard/pending" element={<div>Pending Approval (Coming Soon)</div>} />
                <Route path="/dashboard/categories" element={<div>Categories (Coming Soon)</div>} />
                <Route path="/dashboard/collections" element={<div>Collections (Coming Soon)</div>} />
                <Route path="/dashboard/users" element={<div>Users (Coming Soon)</div>} />
                <Route path="/dashboard/settings" element={<div>Settings (Coming Soon)</div>} />
              </Route>
            </Route>
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all other routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
