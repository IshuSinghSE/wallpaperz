
import { Timestamp } from "firebase/firestore";

export type WallpaperStatus = "pending" | "approved" | "rejected" | "hidden";
export type AuthProvider = "google" | "apple" | "email";

export interface Wallpaper {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl: string;
  downloads: number;
  likes: number;
  views?: number;
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
  createdAt: Timestamp;
  license: string;
  hash: string;
  aspectRatio: number;
  // Aliases for backward compatibility
  get image(): string { return this.imageUrl; }
  get preview(): string { return this.imageUrl; }
  get thumbnail(): string { return this.thumbnailUrl; }
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  iconUrl: string;
  wallpaperCount: number;
  createdAt: Timestamp;
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
  createdAt: Timestamp;
}

export interface User {
  uid: string;
  name?: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: "admin" | "user";
  savedWallpapers?: string[];
  uploadedWallpapers?: string[];
  isPremium?: boolean;
  premiumPurchasedAt?: Timestamp;
  authProvider?: AuthProvider;
  createdAt?: Timestamp;
}
