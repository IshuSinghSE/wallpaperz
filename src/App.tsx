
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";

// Dashboard Components
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Dashboard from "@/pages/dashboard/Dashboard";
import WallpaperList from "@/pages/dashboard/WallpaperList";
import WallpaperUpload from "@/pages/dashboard/WallpaperUpload";
import WallpaperDetails from "@/pages/dashboard/WallpaperDetails";
import PendingApproval from "@/pages/dashboard/PendingApproval";
import Categories from "@/pages/dashboard/Categories";
import Collections from "@/pages/dashboard/Collections";
import Users from "@/pages/dashboard/Users";
import Settings from "@/pages/dashboard/Settings";
import UserProfile from "@/pages/dashboard/UserProfile";

// Auth Pages
import Login from "@/pages/Login";
import Unauthorized from "@/pages/Unauthorized";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected dashboard routes */}
            <Route element={<ProtectedRoute requireAdmin={true} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/wallpapers" element={<WallpaperList />} />
                <Route path="/dashboard/wallpapers/:id" element={<WallpaperDetails />} />
                <Route path="/dashboard/upload" element={<WallpaperUpload />} />
                <Route path="/dashboard/pending" element={<PendingApproval />} />
                <Route path="/dashboard/categories" element={<Categories />} />
                <Route path="/dashboard/collections" element={<Collections />} />
                <Route path="/dashboard/users" element={<Users />} />
                <Route path="/dashboard/settings" element={<Settings />} />
                <Route path="/dashboard/profile" element={<UserProfile />} />
                <Route path="/dashboard/users/:id" element={<UserProfile />} />
              </Route>
            </Route>
            
            {/* Catch all other routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
