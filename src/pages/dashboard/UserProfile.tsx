
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, DocumentData } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Pencil, Upload, Loader2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RefreshButton } from "@/components/ui/refresh-button";

import { useQuery, useMutation } from "@tanstack/react-query";

interface UserData {
  id: string;
  displayName: string;
  email: string;
  photoURL: string;
  username: string;
  bio: string;
  role: string;
  createdAt: any;
}

interface Wallpaper {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  thumbnail: string;
  status: string;
  createdAt: any;
}

const UserProfile = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Form states
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  // Determine if we're viewing the current user's profile or another user
  const isCurrentUser = !id || id === currentUser?.uid;
  const userId = isCurrentUser ? currentUser?.uid : id;
  
  // Get user data
  const { 
    data: userData,
    isLoading: isLoadingUser,
    refetch: refetchUser
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const userDoc = await getDoc(doc(db, "users", userId));
      if (!userDoc.exists()) {
        throw new Error("User not found");
      }
      
      return { 
        id: userDoc.id,
        ...userDoc.data()
      } as UserData;
    },
    enabled: !!userId
  });
  
  // Get user's wallpapers
  const { 
    data: wallpapers,
    isLoading: isLoadingWallpapers,
    refetch: refetchWallpapers
  } = useQuery({
    queryKey: ['userWallpapers', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const wallpapersQuery = query(
        collection(db, "wallpapers"), 
        where("createdBy", "==", userId)
      );
      
      const snapshot = await getDocs(wallpapersQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Wallpaper[];
    },
    enabled: !!userId
  });
  
  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: Partial<UserData>) => {
      if (!userId) throw new Error("No user ID");
      await updateDoc(doc(db, "users", userId), data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      refetchUser();
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update profile: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Effect to populate form fields when user data changes
  useEffect(() => {
    if (userData) {
      setDisplayName(userData.displayName || "");
      setUsername(userData.username || "");
      setBio(userData.bio || "");
    }
  }, [userData]);
  
  // Handle photo file selection
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) return;
    
    let photoURL = userData?.photoURL;
    
    // Upload photo if changed
    if (photoFile) {
      setIsUploading(true);
      const storageRef = ref(storage, `users/${userId}/profile-${Date.now()}`);
      const uploadTask = uploadBytesResumable(storageRef, photoFile);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          setIsUploading(false);
          console.error('Upload failed:', error);
          toast({
            title: "Error",
            description: "Failed to upload profile photo",
            variant: "destructive",
          });
        },
        async () => {
          photoURL = await getDownloadURL(uploadTask.snapshot.ref);
          setIsUploading(false);
          
          // Now update user data with the new photo URL
          updateUserMutation.mutate({
            displayName,
            username,
            bio,
            photoURL
          });
        }
      );
    } else {
      // Just update user data without changing the photo
      updateUserMutation.mutate({
        displayName,
        username,
        bio
      });
    }
  };
  
  const refreshData = () => {
    refetchUser();
    refetchWallpapers();
  };
  
  if (isLoadingUser && !userData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {isCurrentUser ? "My Profile" : `${userData?.displayName}'s Profile`}
          </h1>
          <p className="text-muted-foreground">
            {isCurrentUser ? "Manage your profile and view your uploads" : "View user details and uploads"}
          </p>
        </div>
        <RefreshButton 
          onClick={refreshData} 
          isLoading={isLoadingUser || isLoadingWallpapers} 
        />
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="wallpapers">Wallpapers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card className="backdrop-blur-sm bg-white/10 dark:bg-slate-900/20 border border-white/20 dark:border-slate-800/50 shadow-xl">
            <CardHeader>
              <CardTitle>{isCurrentUser ? "My Information" : "User Information"}</CardTitle>
              <CardDescription>
                {isCurrentUser 
                  ? "Your personal information and profile settings" 
                  : "User's personal information and profile"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-32 w-32">
                      <AvatarImage 
                        src={photoPreview || userData?.photoURL || "/placeholder.svg"} 
                      />
                      <AvatarFallback>
                        <User className="h-16 w-16" />
                      </AvatarFallback>
                    </Avatar>
                    
                    {isEditing && (
                      <div className="flex flex-col gap-2 items-center">
                        <Label 
                          htmlFor="photo" 
                          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md cursor-pointer flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Upload Photo
                        </Label>
                        <input 
                          type="file" 
                          id="photo" 
                          accept="image/*" 
                          onChange={handlePhotoChange} 
                          className="hidden" 
                        />
                        {isUploading && (
                          <div className="w-full bg-background rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4 flex-1">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input 
                        id="displayName" 
                        value={displayName} 
                        onChange={(e) => setDisplayName(e.target.value)}
                        disabled={!isEditing || !isCurrentUser}
                        className="backdrop-blur-sm bg-white/5 border-white/20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={!isEditing || !isCurrentUser}
                        className="backdrop-blur-sm bg-white/5 border-white/20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        value={userData?.email || ""} 
                        disabled
                        className="backdrop-blur-sm bg-white/5 border-white/20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Input 
                        id="bio" 
                        value={bio} 
                        onChange={(e) => setBio(e.target.value)}
                        disabled={!isEditing || !isCurrentUser}
                        className="backdrop-blur-sm bg-white/5 border-white/20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input 
                        id="role" 
                        value={userData?.role || "User"} 
                        disabled
                        className="backdrop-blur-sm bg-white/5 border-white/20"
                      />
                    </div>
                  </div>
                </div>
                
                {isCurrentUser && (
                  <div className="flex justify-end gap-3">
                    {isEditing ? (
                      <>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={updateUserMutation.isPending || isUploading}
                        >
                          {updateUserMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button 
                        type="button" 
                        onClick={() => setIsEditing(true)} 
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="wallpapers">
          <Card className="backdrop-blur-sm bg-white/10 dark:bg-slate-900/20 border border-white/20 dark:border-slate-800/50 shadow-xl">
            <CardHeader>
              <CardTitle>
                {isCurrentUser ? "My Wallpapers" : `${userData?.displayName}'s Wallpapers`}
              </CardTitle>
              <CardDescription>
                {isCurrentUser 
                  ? "Wallpapers you have uploaded to the platform" 
                  : "Wallpapers uploaded by this user"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingWallpapers ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-lg overflow-hidden h-40 animate-pulse bg-muted/50"></div>
                  ))}
                </div>
              ) : wallpapers && wallpapers.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {wallpapers.map((wallpaper) => (
                    <div 
                      key={wallpaper.id} 
                      className="rounded-lg overflow-hidden border border-white/20 dark:border-slate-800/50 hover:shadow-lg transition-shadow group"
                    >
                      <img 
                        src={wallpaper.thumbnail || wallpaper.imageUrl} 
                        alt={wallpaper.name} 
                        className="h-40 w-full object-cover"
                      />
                      <div className="p-2 bg-black/30 backdrop-blur-sm text-white">
                        <h3 className="text-sm font-medium truncate">{wallpaper.name}</h3>
                        <div className="flex justify-between items-center mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            wallpaper.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : wallpaper.status === 'pending' 
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {wallpaper.status}
                          </span>
                          <span className="text-xs text-white/70">
                            {wallpaper.createdAt?.toDate?.() 
                              ? new Date(wallpaper.createdAt.toDate()).toLocaleDateString() 
                              : new Date(wallpaper.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p>No wallpapers found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
