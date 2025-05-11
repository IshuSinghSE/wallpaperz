
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-dashboard-dark to-dashboard-purple-dark p-4">
      <div className="animate-scale-in w-full max-w-md rounded-lg border bg-background p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Access Denied</h1>
          <p className="mt-2 text-muted-foreground">
            You do not have permission to access the admin dashboard.
          </p>
        </div>

        <p className="mb-6 text-center text-sm text-muted-foreground">
          This area is restricted to administrators only. If you believe this is an
          error, please contact the system administrator.
        </p>

        <Button
          variant="default"
          className="w-full"
          onClick={handleSignOut}
        >
          Return to Login
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
