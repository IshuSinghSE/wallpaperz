import React, { useEffect, lazy, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sparkles, Zap, Star, Circle } from "@/lib/icons";
import DownloadButton from "@/components/landing/DownloadButton";

// Lazy load components
const DiagonalCarousel = lazy(() => import("@/components/landing/DiagonalCarousel"));
const FeatureSection = lazy(() => import("@/components/landing/FeatureSection"));
const WallpaperGrid = lazy(() => import("@/components/landing/WallpaperGrid"));
const WhyBloomsplash = lazy(() => import("@/components/landing/WhyBloomsplash"));
const Footer = lazy(() => import("@/components/landing/Footer"));
const AnimatedLogo = lazy(() => import("@/components/landing/AnimatedLogo"));

// Loading components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const SectionLoader = () => (
  <div className="py-16 animate-pulse">
    <div className="container mx-auto px-4">
      <div className="bg-dashboard-surface/20 h-24 rounded-lg mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-dashboard-surface/20 h-48 rounded-lg"></div>
        ))}
      </div>
    </div>
  </div>
);

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
            {i % 4 === 0 && (
              <Sparkles className="w-4 h-4 text-primary/40" />
            )}
            {i % 4 === 1 && (
              <Zap className="w-3 h-3 text-gradient-secondary/30" />
            )}
            {i % 4 === 2 && (
              <Star className="w-2 h-2 text-gradient-accent/50" />
            )}
            {i % 4 === 3 && (
              <Circle className="w-1 h-1 text-primary/60" />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        {/* <header className="container mx-auto py-8 px-4">
          <nav className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground tracking-wider uppercase">
              Premium Wallpapers
            </div>
          </nav>
        </header> */}

        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center relative">
          {/* Animated Logo */}
          
          
          {/* Main Content */}
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <div className="glass-card p-8 md:p-20 animate-scale-in">
              {/* Primary Logo */}
              <div className="mb-8 animate-fade-in">
                <Suspense fallback={<LoadingSpinner />}>
                  <AnimatedLogo />
                </Suspense>
              </div>
              
              {/* Secondary Heading */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 leading-tight">
                <span className="text-gradient-neon mr-1">Ultra 4K </span>
                <span className="text-foreground/90">Wallpapers</span>
              </h1>
              
              <p className="text-xl md:text-2xl mb-8 text-muted-foreground/80 font-light leading-relaxed">
                Discover breathtaking ultra-high-definition wallpapers
                <br className="hidden md:block" />
                crafted for perfection on every device
              </p>
              
              {/* Feature Pills */}
              <div className="flex flex-wrap gap-4 justify-center mb-8">
                {['4K Quality', 'Curated Collection', 'Regular Updates', 'Mobile Optimized'].map((feature, i) => (
                  <div 
                    key={feature}
                    className="glass-card px-6 py-2 text-sm font-medium animate-fade-in hover:bg-purple-600 transition-all duration-500 ease-in"
                    style={{animationDelay: `${0.5 + i * 0.1}s`}}
                  >
                    {feature}
                  </div>
                ))}
              </div>
              
              {/* Download Button */}
              <DownloadButton />
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-primary/70 rounded-full p-1">
              <div className="w-1 h-3 bg-primary/100 rounded-full mx-auto animate-pulse"></div>
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
            <Suspense fallback={<SectionLoader />}>
              <DiagonalCarousel />
            </Suspense>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32">
          <Suspense fallback={<SectionLoader />}>
            <FeatureSection />
          </Suspense>
        </section>
        
        {/* Sample Wallpapers Grid */}
        <section className="py-16 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-dashboard-surface/30 via-dashboard-surface/50 to-dashboard-surface/30"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-gradient-secondary/5 via-transparent to-gradient-accent/5"></div>
          <div className="relative">
            <Suspense fallback={<SectionLoader />}>
              <WallpaperGrid />
            </Suspense>
          </div>
        </section>
        
        {/* Why Section */}
        <section className="py-16 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-dashboard-surface/20 via-dashboard-surface/40 to-dashboard-surface/20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-gradient-primary/5 via-transparent to-gradient-secondary/5"></div>
          <Suspense fallback={<SectionLoader />}>
            <WhyBloomsplash />
          </Suspense>
        </section>
        
        {/* Final CTA */}
        <section className="py-16 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-dashboard-surface/30 via-dashboard-surface/50 to-dashboard-surface/30"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-gradient-accent/5 via-transparent to-gradient-primary/5"></div>
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
                <div className="mt-12 flex justify-center">

                <DownloadButton />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <Suspense fallback={<LoadingSpinner />}>
          <Footer />
        </Suspense>
      </div>
    </div>
  );
};

export default Landing;