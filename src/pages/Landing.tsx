
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import DiagonalCarousel from "@/components/landing/DiagonalCarousel";
import FeatureSection from "@/components/landing/FeatureSection";
import WallpaperGrid from "@/components/landing/WallpaperGrid";
import WhyBloomsplash from "@/components/landing/WhyBloomsplash";
import Footer from "@/components/landing/Footer";
import { ArrowRight } from "lucide-react";

const Landing = () => {
  const { currentUser, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Check if user is already logged in
  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-dashboard-dark text-white overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-dashboard-purple-light/20 via-dashboard-dark to-dashboard-dark"></div>
        <div className="wave-container absolute inset-0">
          <svg className="waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path className="wave1" fill="rgba(139, 92, 246, 0.1)" d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,90.7C672,85,768,107,864,144C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
            <path className="wave2" fill="rgba(139, 92, 246, 0.05)" d="M0,192L48,176C96,160,192,128,288,122.7C384,117,480,139,576,165.3C672,192,768,224,864,213.3C960,203,1056,149,1152,122.7C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
            <path className="wave3" fill="rgba(139, 92, 246, 0.03)" d="M0,64L48,96C96,128,192,192,288,224C384,256,480,256,576,234.7C672,213,768,171,864,165.3C960,160,1056,192,1152,176C1248,160,1344,96,1392,64L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <header className="container mx-auto py-6 px-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-dashboard-purple-light to-dashboard-purple bg-clip-text text-transparent">
              Bloomsplash
            </span>
          </div>
          <div>
            <Button 
              variant="outline" 
              className="glassmorphism border-white/20 text-white hover:bg-white/10"
              onClick={handleSignIn}
            >
              Sign In
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="min-h-[85vh] flex flex-col justify-center py-10">
          <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-gradient animate-fade-in">
              Explore 4K Wallpapers
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mb-8 text-gray-300 animate-fade-in" style={{animationDelay: "0.2s"}}>
              Explore, Create, Share Ultra 4K Wallpapers for your device
            </p>
            
            <Button 
              size="lg" 
              className="animate-fade-in mt-8 bg-dashboard-purple hover:bg-dashboard-purple-light flex items-center gap-2"
              onClick={handleSignIn}
              style={{animationDelay: "0.4s"}}
            >
              Continue with Google
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="w-full overflow-hidden">
            <DiagonalCarousel />
          </div>
        </section>

        {/* Features Section */}
        <FeatureSection />
        
        {/* Sample Wallpapers Section */}
        <WallpaperGrid />
        
        {/* Why Bloomsplash Section */}
        <WhyBloomsplash />
        
        {/* CTA Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center card-gradient p-8 md:p-12 rounded-xl glassmorphism animate-scale-in">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">
                Ready to transform your device?
              </h2>
              <p className="text-lg mb-8 text-gray-300">
                Join thousands of users who have already discovered the perfect wallpapers for their devices.
              </p>
              <Button 
                size="lg" 
                className="bg-dashboard-purple hover:bg-dashboard-purple-light flex items-center gap-2"
                onClick={handleSignIn}
              >
                Continue with Google
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Landing;
