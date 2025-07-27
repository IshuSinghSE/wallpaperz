import { Timestamp } from "firebase/firestore";

export type WallpaperStatus = "pending" | "approved" | "rejected" | "hidden";
export type AuthProvider = "google" | "apple" | "email";

export interface Wallpaper {
  id: string;
  name: string;
  image: string;
  thumbnail: string;
  downloads: number;
  likes: number;
  size: number;
  resolution: string;
  orientation: string;
  category: string;
  tags: string[];
  colors: string[];
  author: string;
  authorImage: string;
  description: string;
  isPremium: boolean;
  isAIgenerated: boolean;
  status: WallpaperStatus;
  createdAt: string;
  license: string;
  hash: string;
}

export interface Category {
  id: string;
  name: string;
  iconUrl: string;
  description: string;
  wallpaperCount?: number;
  createdAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  wallpaperIds: string[];
  coverImage?: string;
  createdBy: string;
  tags?: string[];
  type?: "manual" | "auto";
  createdAt: string;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  isAdmin: boolean;
  isPremium: boolean;
  authProvider: string;
  createdAt: Date | Timestamp;
  premiumPurchasedAt?: Date | Timestamp | null;
  savedWallpapers: string[];
  uploadedWallpapers: string[];
}
