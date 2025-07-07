
import React, { useEffect, useRef } from 'react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from '@/lib/utils';

// Sample wallpaper images - using Unsplash API for high-quality wallpapers
// Local wallpaper images - optimized WebP format
const wallpapers = [
  "/wallpapers/wallpaper_01.webp",
  "/wallpapers/wallpaper_02.webp",
  "/wallpapers/wallpaper_03.webp",
  "/wallpapers/wallpaper_04.webp",
  "/wallpapers/wallpaper_05.webp",
  "/wallpapers/wallpaper_06.webp",
  "/wallpapers/wallpaper_07.webp",
];

const DiagonalCarousel = () => {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (carouselRef.current) {
        const { top } = carouselRef.current.getBoundingClientRect();
        const scrollPosition = window.scrollY;
        const offset = scrollPosition * 0.2;
        
        // Apply parallax effect
        carouselRef.current.style.transform = `translateY(${offset}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      ref={carouselRef}
      className="diagonal-carousel-container w-[150%] md:w-[130%] -ml-[25%] md:-ml-[15%]"
    >
      <Carousel 
        className="overflow-visible"
        opts={{
          align: "start",
          loop: true,
          dragFree: true,
          containScroll: false,
        }}
      >
        <CarouselContent className="-mt-4 -ml-4">
          {wallpapers.map((wallpaper, index) => (
            <CarouselItem 
              key={index} 
              className={cn(
                "ml-4 mt-32 pl-0 basis-1/2 md:basis-1/3 lg:basis-1/4",
                index % 2 === 0 ? "mt-32" : "mt-4"
              )}
            >
              <div className="wallpaper-card h-[300px] md:h-[400px] rounded-lg overflow-hidden hover-scale">
                <div className="wallpaper-inner w-full h-full overflow-hidden rounded-lg glassmorphism border border-white/20">
                  <img 
                    src={wallpaper} 
                    alt={`Wallpaper ${index}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default DiagonalCarousel;
