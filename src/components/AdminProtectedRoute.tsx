import { Navigate, Outlet } from "react-router-dom";

const AdminProtectedRoute = () => {
  const hasAdminAccess = localStorage.getItem("adminAccess") === "true";

  if (!hasAdminAccess) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;