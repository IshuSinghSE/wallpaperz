
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  LayoutDashboard, 
  ImageIcon, 
  Upload, 
  Clock, 
  FolderIcon, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight
} from "lucide-react";

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isOpen: boolean;
}

const NavItem = ({ to, icon: Icon, label, isOpen }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
          isOpen ? "justify-start" : "justify-center",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )
      }
    >
      <Icon className={cn("h-5 w-5", isOpen ? "mr-2" : "mr-0")} />
      {isOpen && <span className="animate-fade-in">{label}</span>}
    </NavLink>
  );
};

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const { currentUser } = useAuth();
  const isMobile = useIsMobile();

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/dashboard/wallpapers", icon: ImageIcon, label: "Wallpapers" },
    { to: "/dashboard/upload", icon: Upload, label: "Upload New" },
    { to: "/dashboard/pending", icon: Clock, label: "Pending Approval" },
    { to: "/dashboard/categories", icon: FolderIcon, label: "Categories" },
    { to: "/dashboard/collections", icon: FolderIcon, label: "Collections" },
    { to: "/dashboard/users", icon: Users, label: "Users" },
    { to: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-300 ease-in-out glassmorphism backdrop-blur-md",
        isOpen ? "w-64" : "w-16",
        isMobile && !isOpen ? "-translate-x-full" : "translate-x-0",
        "lg:relative lg:z-auto"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {isOpen ? (
          <h1 className="text-xl font-bold text-sidebar-foreground">Wallpaper Admin</h1>
        ) : (
          <h1 className="mx-auto text-xl font-bold text-sidebar-foreground">WA</h1>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-md p-1.5 text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => (
            <NavItem 
              key={item.to} 
              to={item.to} 
              icon={item.icon} 
              label={item.label} 
              isOpen={isOpen} 
            />
          ))}
        </nav>
      </div>

      {isOpen && currentUser && (
        <div className="border-t p-4">
          <div className="flex items-center">
            <img
              src={currentUser.photoURL || "/placeholder.svg"}
              alt="User avatar"
              className="h-8 w-8 rounded-full"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-sidebar-foreground">
                {currentUser.displayName}
              </p>
              <p className="text-xs text-sidebar-foreground/60">Admin</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
