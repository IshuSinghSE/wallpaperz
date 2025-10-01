import React, { memo } from 'react';
import { Facebook, Instagram, Twitter } from '@/lib/icons';
import AnimatedLogo from './AnimatedLogo';

const Footer = memo(() => {
  return (
    <footer className="py-12 bg-dashboard-dark/80 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between items-center">
            <div className="md:scale-75 md:origin-left scale-105">
              <AnimatedLogo />
            </div>
          {/* <div className="mb-6 md:mb-0">
            <p className="mt-2 text-sm text-gray-400">
              Explore, Create, Share Ultra 4K Wallpapers
            </p>
          </div> */}
          
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <a href="#" className="text-gray-400 hover:text-white transition">Home</a>
            <a href="https://github.com/IshuSinghSE/bloomsplash/releases/latest/" className="text-gray-400 hover:text-white transition">Download</a>
            <a href="#features" className="text-gray-400 hover:text-white transition">Features</a>
            <a href="#wallpapers" className="text-gray-400 hover:text-white transition">Wallpapers</a>
            <a href="#why-bloomsplash" className="text-gray-400 hover:text-white transition">Why Bloomsplash</a>
          </div>
          
          <div className="mt-6 md:mt-0 flex gap-4">
            <a href="#" className="text-gray-400 hover:text-white transition">
              <Facebook size={20} />
              <span className="sr-only">Facebook</span>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <Instagram size={20} />
              <span className="sr-only">Instagram</span>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <Twitter size={20} />
              <span className="sr-only">Twitter</span>
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Bloomsplash. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex gap-4 text-sm">
            <a href="#" className="text-gray-400 hover:text-white transition">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white transition">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
