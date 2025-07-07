
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import { lazy, Suspense } from "react";

// Immediately loaded components
import NotFound from "./pages/NotFound";

// Lazy loaded components
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const AdminAccess = lazy(() => import("./pages/AdminAccess"));

// Dashboard Components - Lazy loaded
const DashboardLayout = lazy(() => import("@/components/dashboard/DashboardLayout"));
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const WallpaperList = lazy(() => import("@/pages/dashboard/WallpaperList"));
const WallpaperUpload = lazy(() => import("@/pages/dashboard/WallpaperUpload"));
const WallpaperDetails = lazy(() => import("@/pages/dashboard/WallpaperDetails"));
const PendingApproval = lazy(() => import("@/pages/dashboard/PendingApproval"));
const Categories = lazy(() => import("@/pages/dashboard/Categories"));
const Collections = lazy(() => import("@/pages/dashboard/Collections"));
const Users = lazy(() => import("@/pages/dashboard/Users"));
const Settings = lazy(() => import("@/pages/dashboard/Settings"));
const UserProfile = lazy(() => import("@/pages/dashboard/UserProfile"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-dashboard-bg">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/admin" element={<AdminAccess />} />
              
              {/* Admin protected routes */}
              <Route element={<AdminProtectedRoute />}>
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
              </Route>
              
              {/* Catch all other routes */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
