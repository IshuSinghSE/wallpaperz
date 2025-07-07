import { useEffect, useState } from "react";

const AnimatedLogo = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`relative flex items-center justify-center transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      <svg
        width="300"
        height="80"
        viewBox="0 0 300 80"
        className="overflow-visible"
      >
        {/* Glow background */}
        <defs>
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--gradient-primary))" />
            <stop offset="50%" stopColor="hsl(var(--gradient-secondary))" />
            <stop offset="100%" stopColor="hsl(var(--gradient-accent))" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feOffset dx="0" dy="0" result="offset"/>
            <feFlood floodColor="url(#textGradient)" floodOpacity="0.8"/>
            <feComposite in2="offset" operator="in"/>
            <feMerge> 
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background blur for neon effect */}
        <text
          x="150"
          y="45"
          textAnchor="middle"
          className="text-4xl font-bold tracking-wider"
          fill="url(#textGradient)"
          filter="url(#glow)"
          opacity="0.6"
        >
          BloomSplash
        </text>
        
        {/* Main text */}
        <text
          x="150"
          y="45"
          textAnchor="middle"
          className="text-4xl font-bold tracking-wider animate-pulse"
          fill="url(#textGradient)"
          filter="url(#neonGlow)"
        >
          BloomSplash
        </text>
        
        {/* Animated particles */}
        {[...Array(6)].map((_, i) => (
          <circle
            key={i}
            cx={50 + i * 40}
            cy={20 + Math.sin(i) * 10}
            r="2"
            fill="url(#textGradient)"
            opacity="0.8"
            className="animate-pulse"
            style={{
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + i * 0.2}s`
            }}
          >
            <animate
              attributeName="cy"
              values={`${20 + Math.sin(i) * 10};${15 + Math.sin(i) * 10};${20 + Math.sin(i) * 10}`}
              dur={`${3 + i * 0.5}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur={`${2 + i * 0.3}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>
      
      {/* Additional glow effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-xl opacity-50 animate-pulse"
        style={{ animationDuration: '3s' }}
      ></div>
    </div>
  );
};

export default AnimatedLogo;