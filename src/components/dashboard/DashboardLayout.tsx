
import { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Auto-close sidebar on mobile when component mounts
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  // Handle clicks on the main content area to close sidebar on mobile
  useEffect(() => {
    const handleMainContentClick = () => {
      if (isMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    const mainContent = mainContentRef.current;
    if (mainContent) {
      mainContent.addEventListener("click", handleMainContentClick);
    }

    return () => {
      if (mainContent) {
        mainContent.removeEventListener("click", handleMainContentClick);
      }
    };
  }, [isMobile, sidebarOpen]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <div className="flex min-h-screen bg-background transition-colors duration-300">
          {/* Static sidebar container */}
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
          
          {/* Main content area - pushes away on desktop, overlaps on mobile */}
          <div 
            ref={mainContentRef}
            className={cn(
              "flex flex-col flex-1 transition-all duration-300",
              !isMobile && sidebarOpen ? "ml-64" : !isMobile ? "ml-16" : "ml-0"
            )}
          >
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            
            <main className="flex-1 overflow-y-auto p-4 md:p-6 animate-fade-in">
              <div className="mx-auto max-w-7xl">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default DashboardLayout;
