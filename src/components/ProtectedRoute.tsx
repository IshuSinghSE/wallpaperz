
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireAdmin = true }) => {
  const { currentUser, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
