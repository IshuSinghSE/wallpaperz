
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { convertTimestamp, prepareTimestampForFirestore } from '@/lib/react-query';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL: string;
  username: string;
  bio: string;
  role: string;
  createdAt: any;
}

export interface UserWallpaper {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  thumbnail: string;
  status: string;
  createdAt: any;
}

export function useUserProfile(userId?: string) {
  const { currentUser } = useAuth();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Determine if we're viewing the current user's profile or another user
  const userIdToFetch = userId || currentUser?.uid;
  const isCurrentUser = !userId || userId === currentUser?.uid;

  // Fetch user data
  const {
    data: userData,
    isLoading: isLoadingUser,
    refetch: refetchUser
  } = useQuery({
    queryKey: ['user', userIdToFetch],
    queryFn: async () => {
      if (!userIdToFetch) return null;
      
      const userDoc = await getDoc(doc(db, "users", userIdToFetch));
      if (!userDoc.exists()) {
        throw new Error("User not found");
      }
      
      const data = userDoc.data();
      return { 
        id: userDoc.id,
        ...data,
        createdAt: data.createdAt ? convertTimestamp(data.createdAt) : new Date()
      } as UserProfile;
    },
    enabled: !!userIdToFetch
  });

  // Fetch user's wallpapers
  const {
    data: wallpapers,
    isLoading: isLoadingWallpapers,
    refetch: refetchWallpapers
  } = useQuery({
    queryKey: ['userWallpapers', userIdToFetch],
    queryFn: async () => {
      if (!userIdToFetch) return [];
      
      const wallpapersQuery = query(
        collection(db, "wallpapers"), 
        where("createdBy", "==", userIdToFetch)
      );
      
      const snapshot = await getDocs(wallpapersQuery);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? convertTimestamp(data.createdAt) : new Date()
        };
      }) as UserWallpaper[];
    },
    enabled: !!userIdToFetch
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      if (!userIdToFetch) throw new Error("No user ID");
      const preparedData = prepareTimestampForFirestore(data);
      await updateDoc(doc(db, "users", userIdToFetch), preparedData);
      return data;
    },
    onSuccess: () => {
      refetchUser();
    }
  });

  // Upload profile photo
  const uploadProfilePhoto = async (file: File): Promise<string> => {
    if (!userIdToFetch) throw new Error("No user ID");
    
    setIsUploading(true);
    setUploadProgress(0);
    
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `users/${userIdToFetch}/profile-${Date.now()}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          setIsUploading(false);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setIsUploading(false);
          resolve(downloadURL);
        }
      );
    });
  };

  // Refresh all data
  const refreshData = () => {
    refetchUser();
    refetchWallpapers();
  };

  return {
    userData,
    wallpapers,
    isLoadingUser,
    isLoadingWallpapers,
    updateUser: updateUserMutation.mutate,
    isUpdating: updateUserMutation.isPending,
    uploadProfilePhoto,
    uploadProgress,
    isUploading,
    refreshData,
    isCurrentUser
  };
}
