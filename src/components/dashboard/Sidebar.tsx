
import { NavLink, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useRef } from "react";
import { LayoutDashboard, ImageIcon, Upload, Clock, FolderIcon, Users, Settings, ChevronLeft, ChevronRight, User } from '@/lib/icons';

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
  const sidebarRef = useRef<HTMLElement>(null);

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

  // Handle clicks outside the sidebar to close it on mobile
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (isMobile && isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isMobile, isOpen, setIsOpen]);

  return (
    <aside
      ref={sidebarRef}
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/20 dark:border-slate-800/50 transition-all duration-300 ease-in-out glassmorphism backdrop-blur-md",
        isOpen ? "w-64" : "w-16",
        // On mobile: translate offscreen when closed, show when open
        isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {isOpen ? (
          <h1 className="text-xl font-bold text-sidebar-foreground">Wallpaper Admin</h1>
        ) : (
          <h1 className="mx-auto text-xl font-bold text-sidebar-foreground">WA</h1>
        )}
        {/* Only show this button on larger screens */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "rounded-md p-1.5 text-sidebar-foreground hover:bg-sidebar-accent/50",
            isMobile && "hidden" // Hide on mobile
          )}
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

      {currentUser && (
        <Link 
          to="/dashboard/profile" 
          className="border-t border-white/20 dark:border-slate-800/50 p-4 hover:bg-sidebar-accent/50 transition-colors"
        >
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full overflow-hidden bg-sidebar-accent/30">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="User avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <User className="h-5 w-5 text-sidebar-foreground" />
                </div>
              )}
            </div>
            {isOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium text-sidebar-foreground">
                  {currentUser.displayName || "User Profile"}
                </p>
                <p className="text-xs text-sidebar-foreground/60">View Profile</p>
              </div>
            )}
          </div>
        </Link>
      )}
    </aside>
  );
};

export default Sidebar;
