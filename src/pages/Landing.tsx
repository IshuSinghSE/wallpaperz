import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import DiagonalCarousel from "@/components/landing/DiagonalCarousel";
import FeatureSection from "@/components/landing/FeatureSection";
import WallpaperGrid from "@/components/landing/WallpaperGrid";
import WhyBloomsplash from "@/components/landing/WhyBloomsplash";
import Footer from "@/components/landing/Footer";
import AnimatedLogo from "@/components/landing/AnimatedLogo";
import { Sparkles, Zap, Star, Circle } from "lucide-react";

const Landing = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Check if user is already logged in
  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-dashboard-bg text-foreground">
      {/* Dynamic Background with Grain Texture */}
      <div className="fixed inset-0 hero-gradient grain-texture">
        {/* Animated Blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-gradient-primary/20 to-gradient-secondary/20 rounded-full blur-3xl blob-animation"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-gradient-secondary/20 to-gradient-accent/20 rounded-full blur-3xl blob-animation-delayed"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-gradient-accent/15 to-gradient-primary/15 rounded-full blur-2xl blob-animation" style={{animationDelay: '5s'}}></div>
        
        {/* Floating Elements */}
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            {i % 4 === 0 && <Sparkles className="w-4 h-4 text-primary/40" />}
            {i % 4 === 1 && <Zap className="w-3 h-3 text-gradient-secondary/30" />}
            {i % 4 === 2 && <Star className="w-2 h-2 text-gradient-accent/50" />}
            {i % 4 === 3 && <Circle className="w-1 h-1 text-primary/60" />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <header className="container mx-auto py-8 px-4">
          <nav className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground tracking-wider uppercase">
              Premium Wallpapers
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center relative">
          {/* Animated Logo */}
          <div className="mb-16 animate-fade-in">
            <AnimatedLogo />
          </div>
          
          {/* Main Content */}
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <div className="glass-card p-8 md:p-12 animate-scale-in">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
                <span className="text-gradient-neon">Ultra 4K</span>
                <br />
                <span className="text-foreground/90">Wallpapers</span>
              </h1>
              
              <p className="text-xl md:text-2xl mb-12 text-muted-foreground/80 font-light leading-relaxed">
                Discover breathtaking ultra-high-definition wallpapers
                <br className="hidden md:block" />
                crafted for perfection on every device
              </p>
              
              {/* Feature Pills */}
              <div className="flex flex-wrap gap-4 justify-center mb-16">
                {['4K Quality', 'Curated Collection', 'Regular Updates', 'Mobile Optimized'].map((feature, i) => (
                  <div 
                    key={feature}
                    className="glass-card px-6 py-2 text-sm font-medium animate-fade-in"
                    style={{animationDelay: `${0.5 + i * 0.1}s`}}
                  >
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-primary/50 rounded-full p-1">
              <div className="w-1 h-3 bg-primary/70 rounded-full mx-auto animate-pulse"></div>
            </div>
          </div>
        </section>

        {/* Sample Wallpapers Section */}
        <section className="py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dashboard-surface/20 to-transparent"></div>
          <div className="container mx-auto px-4 relative">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="text-gradient">Explore Collections</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Immerse yourself in our carefully curated collection of stunning 4K wallpapers
              </p>
            </div>
            <DiagonalCarousel />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32">
          <FeatureSection />
        </section>
        
        {/* Sample Wallpapers Grid */}
        <section className="py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-dashboard-bg via-transparent to-dashboard-bg"></div>
          <div className="relative">
            <WallpaperGrid />
          </div>
        </section>
        
        {/* Why Section */}
        <section className="py-32">
          <WhyBloomsplash />
        </section>
        
        {/* Final CTA */}
        <section className="py-32 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="glass-card p-12 md:p-16 animate-scale-in">
                <h2 className="text-4xl md:text-5xl font-bold mb-8">
                  <span className="text-gradient-neon">Ready to Transform</span>
                  <br />
                  <span className="text-foreground/90">Your Screen?</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                  Join our community of design enthusiasts and discover wallpapers 
                  that bring your devices to life with stunning clarity and beauty.
                </p>
                
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  {[
                    { number: '10K+', label: 'Wallpapers' },
                    { number: '4K', label: 'Resolution' },
                    { number: '50+', label: 'Categories' },
                    { number: '99%', label: 'Satisfaction' }
                  ].map((stat, i) => (
                    <div key={stat.label} className="animate-fade-in" style={{animationDelay: `${i * 0.1}s`}}>
                      <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">{stat.number}</div>
                      <div className="text-sm text-muted-foreground uppercase tracking-wide">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
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