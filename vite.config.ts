import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React chunks
          if (id.includes('react') && id.includes('node_modules')) {
            if (id.includes('react-dom')) return 'react-core';
            if (id.includes('react-router')) return 'react-router';
            return 'react-core';
          }
          
          // Firebase chunks - Keep all Firebase modules together to avoid initialization issues
          if (id.includes('firebase') || id.includes('@firebase')) {
            return 'firebase-core';
          }
          
          // UI library chunks
          if (id.includes('@radix-ui')) return 'radix-ui';
          if (id.includes('@tanstack/react-query')) return 'tanstack-query';
          if (id.includes('react-hook-form')) return 'form-handling';
          if (id.includes('date-fns')) return 'date-utils';
          
          // Landing page components
          if (id.includes('src/components/landing/AnimatedLogo')) return 'landing-hero';
          if (id.includes('src/components/landing/') && 
              (id.includes('DiagonalCarousel') || id.includes('FeatureSection') || 
               id.includes('WallpaperGrid') || id.includes('WhyBloomsplash'))) {
            return 'landing-content';
          }
          if (id.includes('src/components/landing/Footer')) return 'landing-footer';
          
          // Dashboard components
          if (id.includes('src/components/dashboard/')) return 'dashboard-core';
          
          // UI components
          if (id.includes('src/components/ui/')) {
            if (id.includes('carousel') || id.includes('aspect-ratio')) return 'ui-carousel';
            if (id.includes('dialog') || id.includes('select') || 
                id.includes('tabs') || id.includes('table')) return 'ui-complex';
            return 'ui-basic';
          }
          
          return undefined;
        }
      }
    },
    chunkSizeWarningLimit: 300,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
}));
