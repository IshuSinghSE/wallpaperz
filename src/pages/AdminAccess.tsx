import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

const AdminAccess = () => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const ADMIN_CODE = "111636";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (code === ADMIN_CODE) {
      // Store admin access in localStorage
      localStorage.setItem("adminAccess", "true");
      toast({
        title: "Access granted",
        description: "Welcome to the admin area"
      });
      navigate("/login");
    } else {
      toast({
        title: "Access denied",
        description: "Invalid admin code",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-dashboard-dark to-dashboard-purple-dark p-4">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
          <p className="text-muted-foreground">
            Enter the admin code to continue
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? "Verifying..." : "Access Admin"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAccess;