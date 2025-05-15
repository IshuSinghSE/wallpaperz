
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const reasons = [
  {
    title: "Minimal UI",
    description: "Clean and intuitive interface that puts the focus on wallpapers, not distractions.",
    delay: "0s"
  },
  {
    title: "Lightning Fast",
    description: "Optimized performance ensures quick loading and smooth browsing experience.",
    delay: "0.2s"
  },
  {
    title: "Curated Collection",
    description: "Hand-picked wallpapers by professional designers for exceptional quality.",
    delay: "0.4s"
  },
];

const WhyBloomsplash = () => {
  return (
    <section className="py-20 relative bg-dashboard-dark/50" id="why-bloomsplash">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-gradient">
          Why Bloomsplash
        </h2>
        <p className="text-center text-gray-300 max-w-3xl mx-auto mb-12">
          What makes our wallpaper app stand out from the rest
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <div 
              key={index}
              className="animate-fade-in"
              style={{ animationDelay: reason.delay }}
            >
              <Card className="glassmorphism border-white/10 h-full bg-gradient-to-br from-white/5 to-white/0">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-dashboard-purple">{reason.title}</h3>
                  <p className="text-gray-300">{reason.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyBloomsplash;
