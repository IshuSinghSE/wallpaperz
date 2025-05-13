
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, Bell, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const { signOut, currentUser } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of the admin panel."
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center border-b backdrop-blur-sm bg-background/80 dark:bg-background/50 px-4 shadow-sm transition-all duration-200">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative ml-2 hidden md:flex flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search wallpapers, categories..."
          className="h-9 w-full max-w-md rounded-md border border-input bg-background/50 backdrop-blur-sm pl-10 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="ml-auto flex items-center space-x-4">
        <ThemeToggle />
        
        <button className="relative rounded-full p-1.5 text-muted-foreground hover:bg-muted">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            3
          </span>
        </button>

        {isMobile && (
          <Link to="/dashboard/profile" className="flex items-center">
            <div className="h-8 w-8 rounded-full overflow-hidden bg-muted">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="User avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs font-medium text-muted-foreground">
                    {currentUser?.displayName?.charAt(0) || "U"}
                  </span>
                </div>
              )}
            </div>
          </Link>
        )}

        <Button variant="outline" size="sm" onClick={handleSignOut} className="glassmorphism hidden md:flex">
          Sign Out
        </Button>
      </div>
    </header>
  );
};

export default Header;
