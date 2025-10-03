
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { Share, ImageIcon, Star } from '@/lib/icons';

const features = [
  {
    icon: 'image',
    title: "Explore",
    description: "Browse through our vast collection of 4K ultra HD wallpapers for any device.",
    className: "bg-gradient-to-br from-purple-500/20 to-purple-700/20",
    delay: "0s"
  },
  {
    icon: 'star',
    title: "Create",
    description: "Upload and customize your own wallpapers with our easy-to-use tools.",
    className: "bg-gradient-to-br from-blue-500/20 to-blue-700/20",
    delay: "0.2s"
  },
  {
    icon: 'share',
    title: "Share",
    description: "Share your favorite wallpapers with friends or the Bloomsplash community.",
    className: "bg-gradient-to-br from-indigo-500/20 to-indigo-700/20",
    delay: "0.4s"
  },
];

const iconMap = {
  image: ImageIcon,
  star: Star,
  share: Share,
};

const FeatureSection = () => {
  const [visibleCards, setVisibleCards] = useState<boolean[]>(new Array(features.length).fill(false));
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    cardRefs.current.forEach((ref, index) => {
      if (ref) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setVisibleCards(prev => {
                const newState = [...prev];
                newState[index] = true;
                return newState;
              });
              observer.unobserve(ref);
            }
          },
          {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
          }
        );
        observer.observe(ref);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, []);

  return (
    <section className="py-20 mt-12 relative" id="features">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-gradient">
          Explore, Create, Share
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon as keyof typeof iconMap];
            return (
              <div 
                key={index}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className={cn(
                  "transition-all duration-700 ease-out",
                  visibleCards[index] 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-8"
                )}
                style={{ 
                  transitionDelay: visibleCards[index] ? `${index * 150}ms` : '0ms'
                }}
              >
                <Card className={cn(
                  "glassmorphism border-white/10 overflow-hidden h-full hover:scale-105 transition-transform duration-300", 
                  feature.className
                )}>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-white/10">
                      {IconComponent && <IconComponent size={32} className="text-dashboard-purple" />}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-gray-300">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
       
      </div>
    </section>
  );
};

export default FeatureSection;
