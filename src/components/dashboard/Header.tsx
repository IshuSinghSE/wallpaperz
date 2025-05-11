
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, Bell, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const { signOut } = useAuth();
  const { toast } = useToast();

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
    <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-4 shadow-sm">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="mr-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative ml-2 hidden flex-1 md:flex">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search wallpapers, categories..."
          className="h-9 w-full max-w-md rounded-md border border-input bg-background pl-10 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="ml-auto flex items-center space-x-4">
        <button className="relative rounded-full p-1.5 text-muted-foreground hover:bg-muted">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            3
          </span>
        </button>

        <Button variant="outline" size="sm" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </header>
  );
};

export default Header;
