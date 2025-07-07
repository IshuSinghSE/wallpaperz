
import React, { useState } from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from '@/lib/utils';

// Sample wallpaper grid images - using Unsplash API for high-quality images
// Local collection images - optimized WebP format
const wallpaperItems = [
  { id: 1, src: "/collections/collection_01.webp", alt: "Nature wallpaper" },
  { id: 2, src: "/collections/collection_02.webp", alt: "Abstract wallpaper" },
  { id: 3, src: "/collections/collection_03.webp", alt: "Technology wallpaper" },
  { id: 4, src: "/collections/collection_04.webp", alt: "Space wallpaper" },
  { id: 5, src: "/collections/collection_05.webp", alt: "City wallpaper" },
  { id: 6, src: "/collections/collection_06.webp", alt: "Animals wallpaper" },
];

const WallpaperGrid = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  return (
    <section className="py-12 relative" id="wallpapers">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-gradient">
          Featured Wallpapers
        </h2>
        <p className="text-center text-gray-300 max-w-3xl mx-auto mb-8">
          Browse our collection of handpicked premium wallpapers for your device
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wallpaperItems.map((item, index) => (
            <div 
              key={item.id}
              className="animate-fade-in relative"
              style={{ animationDelay: `${index * 0.1}s` }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className={cn(
                "rounded-lg overflow-hidden border border-white/10 transition-all duration-300",
                hoveredIndex === index ? "transform scale-[1.03] shadow-xl" : ""
              )}>
                <AspectRatio ratio={16/10}>
                  <img 
                    src={item.src} 
                    alt={item.alt}
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
                
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4 opacity-0 transition-opacity duration-300",
                  hoveredIndex === index ? "opacity-100" : ""
                )}>
                  <h3 className="text-white text-lg font-bold">{item.alt}</h3>
                  <p className="text-gray-200 text-sm">Premium Collection</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WallpaperGrid;
