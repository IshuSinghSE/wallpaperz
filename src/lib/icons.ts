// Custom icon implementation to drastically reduce bundle size
// This replaces lucide-react imports with only the icons we actually use

import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// Base icon component
const createIcon = (path: string, viewBox = "0 0 24 24") => 
  ({ className, size = 24, ...props }: IconProps & React.SVGProps<SVGSVGElement>) =>
    React.createElement("svg", {
      className,
      width: size,
      height: size,
      viewBox,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
      ...props
    }, React.createElement("path", { d: path }));

// Only include the icons we actually use
export const Sparkles = createIcon("m9 12 2 2 4-4M21 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM3 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM12 21c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM12 3c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z");
export const Zap = createIcon("M13 2L3 14h9l-1 8 10-12h-9l1-8z");
export const Star = createIcon("m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z");
export const Circle = createIcon("M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z");

// Download and social icons
export const Download = createIcon("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3");
export const Github = createIcon("M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 4 5 4 5 4c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 11c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4M9 18c-4.51 2-5-2-7-2");
export const Facebook = createIcon("M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z");
export const Instagram = createIcon("M16 8a6 6 0 0 1 6 6v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V10a6 6 0 0 1 6-6h8zM12 18a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm5-9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z");
export const Twitter = createIcon("M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z");

// Navigation and UI icons
export const ChevronLeft = createIcon("m15 18-6-6 6-6");
export const ChevronRight = createIcon("m9 18 6-6-6-6");
export const ChevronDown = createIcon("m6 9 6 6 6-6");
export const ChevronUp = createIcon("m18 15-6-6-6 6");
export const ArrowLeft = createIcon("M12 19l-7-7 7-7M5 12h14");
export const ArrowRight = createIcon("m5 12 7-7 7 7M5 12h14");
export const ArrowUp = createIcon("M12 5l-7 7 7 7M12 5v14");
export const ArrowDown = createIcon("M12 19l7-7-7-7M12 5v14");

// Action icons
export const Edit = createIcon("M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z");
export const Trash2 = createIcon("M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6");
export const Plus = createIcon("M12 5v14M5 12h14");
export const Minus = createIcon("M5 12h14");
export const X = createIcon("M18 6 6 18M6 6l12 12");
export const Check = createIcon("M20 6 9 17l-5-5");
export const Search = createIcon("m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z");
export const RefreshCw = createIcon("M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M21 8v3h-3M3 16v-3h3");

// Dashboard icons
export const LayoutDashboard = createIcon("M7 3v18M3 7h18M3 17h4M21 7v10");
export const ImageIcon = createIcon("M15 8h.01M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6zM8 14l2.5-2.5L13 14l4.5-4.5L21 13");
export const Upload = createIcon("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12");
export const Clock = createIcon("M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2");
export const FolderIcon = createIcon("M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z");
export const Users = createIcon("M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75");
export const Settings = createIcon("M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z");
export const User = createIcon("M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z");

// Common UI icons
export const Menu = createIcon("M4 6h16M4 12h16M4 18h16");
export const Bell = createIcon("M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M13.73 21a2 2 0 0 1-3.46 0");
export const MoreHorizontal = createIcon("M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z");

// Feature icons
export const Share = createIcon("M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13");
export const Image = createIcon("M15 8h.01M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6zM8 14l2.5-2.5L13 14l4.5-4.5L21 13");

// Loading icons
export const Loader2 = createIcon("M21 12a9 9 0 1 1-6.219-8.56");

// Additional icons as needed
export const Filter = createIcon("M22 3H2l8 9.46V19l4 2v-8.54L22 3z");
export const Eye = createIcon("M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z");
export const EyeOff = createIcon("M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20");

// Theme icons
export const Moon = createIcon("M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z");
export const Sun = createIcon("M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 6.34l-1.41-1.41M19.07 19.07l-1.41-1.41");

// Device icons
export const Monitor = createIcon("M8 21h8M12 17v4M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z");
export const Smartphone = createIcon("M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM12 18h.01");
export const LayoutPanelTop = createIcon("M3 3h18v7H3zM3 14h8v7H3zM15 14h6v7h-6z");

// Security and status icons
export const Lock = createIcon("M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4");
export const AlertTriangle = createIcon("m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3zM12 9v4M12 17h.01");

// Additional utility icons
export const Copy = createIcon("M20 9H11a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2Z M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1");
export const Replace = createIcon("M14 4a4 4 0 0 1 0 8M10 20a4 4 0 0 1 0-8M16 12h6M21 9l3 3-3 3M2 12h6M5 15l-3-3 3-3");
export const Pencil = createIcon("M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z");
export const Dot = createIcon("M12.1 12.1a1 1 0 1 1-2 0 1 1 0 0 1 2 0z");
export const GripVertical = createIcon("M9 12h.01M15 12h.01M9 16h.01M15 16h.01M9 8h.01M15 8h.01");
export const PanelLeft = createIcon("M14 6v12M14 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10M20 6v12");

// Export all icons as default to maintain compatibility
export default {
  Sparkles, Zap, Star, Circle, Download, Github, Facebook, Instagram, Twitter,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ArrowLeft, ArrowRight, ArrowUp, ArrowDown,
  Edit, Trash2, Plus, Minus, X, Check, Search, RefreshCw,
  LayoutDashboard, ImageIcon, Upload, Clock, FolderIcon, Users, Settings, User,
  Menu, Bell, MoreHorizontal, Share, Image, Loader2, Filter, Eye, EyeOff,
  Moon, Sun, Monitor, Smartphone, LayoutPanelTop, Lock, AlertTriangle,
  Copy, Replace, Pencil, Dot, GripVertical, PanelLeft
};
