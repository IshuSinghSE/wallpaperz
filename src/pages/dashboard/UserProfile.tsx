
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Pencil, Upload, Loader2, User, Image as ImageIcon } from '@/lib/icons';
import { useToast } from "@/hooks/use-toast";
import { RefreshButton } from "@/components/ui/refresh-button";
import { useUserProfile } from "@/hooks/use-user-profile";

const UserProfile = () => {
  const { id } = useParams();
  const { toast } = useToast();
  
  const {
    userData,
    wallpapers,
    isLoadingUser,
    isLoadingWallpapers,
    updateUser,
    isUpdating,
    uploadProfilePhoto,
    uploadProgress,
    isUploading,
    refreshData,
    isCurrentUser
  } = useUserProfile(id);
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
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
    
    try {
      let photoURL = userData?.photoURL;
      
      // Upload photo if changed
      if (photoFile) {
        try {
          photoURL = await uploadProfilePhoto(photoFile);
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to upload profile photo",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Update user data
      updateUser({
        displayName,
        username,
        bio,
        photoURL
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update profile: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isCurrentUser ? "My Profile" : `${userData?.displayName}'s Profile`}
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
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
              <CardTitle className="text-gray-900 dark:text-white">{isCurrentUser ? "My Information" : "User Information"}</CardTitle>
              <CardDescription className="text-gray-700 dark:text-gray-300">
                {isCurrentUser 
                  ? "Your personal information and profile settings" 
                  : "User's personal information and profile"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-32 w-32 border-2 border-primary/30">
                      <AvatarImage 
                        src={photoPreview || userData?.photoURL} 
                      />
                      <AvatarFallback className="bg-primary/10">
                        <User className="h-16 w-16 text-primary/60" />
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
                        className="backdrop-blur-sm bg-white/5 border-white/20 focus:border-primary/50 transition-colors"
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
                          disabled={isUpdating || isUploading}
                          className="bg-gradient-to-r from-primary to-primary/80"
                        >
                          {isUpdating && (
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
                        className="flex items-center gap-2 backdrop-blur-sm bg-white/5 border-white/20 hover:bg-white/10"
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
          <Card className="backdrop-blur-sm bg-white/10 dark:bg-slate-900/20 border border-white/20 dark:border-slate-800/50 shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                {isCurrentUser ? "My Wallpapers" : `${userData?.displayName}'s Wallpapers`}
              </CardTitle>
              <CardDescription className="text-gray-700 dark:text-gray-300">
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
                      <div className="h-40 w-full relative overflow-hidden">
                        <img 
                          src={wallpaper.thumbnail || wallpaper.imageUrl} 
                          alt={wallpaper.name} 
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                          <span className="text-white text-sm truncate w-full">{wallpaper.name}</span>
                        </div>
                      </div>
                      
                      <div className="p-2 bg-black/30 backdrop-blur-sm text-white border-t border-white/10">
                        <div className="flex justify-between items-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            wallpaper.status === 'approved' 
                              ? 'bg-green-500/20 text-green-300' 
                              : wallpaper.status === 'pending' 
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-red-500/20 text-red-300'
                          }`}>
                            {wallpaper.status}
                          </span>
                          <span className="text-xs text-white/70">
                            {new Date(wallpaper.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-medium">No wallpapers found</h3>
                  <p className="text-muted-foreground mt-1 max-w-sm">
                    {isCurrentUser ? 
                      "You haven't uploaded any wallpapers yet. Start by uploading your first wallpaper." : 
                      "This user hasn't uploaded any wallpapers yet."}
                  </p>
                  {isCurrentUser && (
                    <Button className="mt-4" variant="outline" asChild>
                      <a href="/dashboard/upload">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Wallpaper
                      </a>
                    </Button>
                  )}
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
