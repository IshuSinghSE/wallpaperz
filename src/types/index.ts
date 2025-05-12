
import { Timestamp } from "firebase/firestore";

export type WallpaperStatus = "pending" | "approved" | "rejected" | "hidden";

export interface Wallpaper {
  id: string;
  name: string;
  image: string;       // Changed from imageUrl
  thumbnail: string;   // Changed from thumbnailUrl
  preview: string;     // Changed from previewUrl
  blurHash: string;
  downloads: number;
  likes: number;
  views: number;
  size: number;
  resolution: string;
  aspectRatio: number;
  orientation: string;
  category: string;
  collections: string[];
  tags: string[];
  colors: string[];
  author: string;
  authorImage: string;
  uploadedBy: string;
  description: string;
  isPremium: boolean;
  isAIgenerated: boolean;
  status: WallpaperStatus;
  createdAt: Timestamp;
  license: string;
  hash: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  wallpaperCount: number;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  wallpaperIds: string[];
  thumbnailUrl?: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: "admin" | "user";
}
