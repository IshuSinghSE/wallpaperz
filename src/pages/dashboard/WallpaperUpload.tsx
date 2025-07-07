
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, X, Plus } from '@/lib/icons';
import { useToast } from "@/hooks/use-toast";

const WallpaperUpload = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    author: "",
    resolution: "",
    license: "Standard",
    category: "",
    tags: [] as string[],
    colors: [] as string[],
    collections: [] as string[],
    isPremium: false,
    isAIgenerated: false,
  });
  
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  
  const [tagInput, setTagInput] = useState("");
  const [colorInput, setColorInput] = useState("#000000");
  
  const [uploading, setUploading] = useState(false);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      switch (fileType) {
        case "original":
          setOriginalFile(file);
          break;
        case "preview":
          setPreviewFile(file);
          break;
        case "thumbnail":
          setThumbnailFile(file);
          break;
      }
    }
  };

  // Remove selected file
  const removeFile = (fileType: string) => {
    switch (fileType) {
      case "original":
        setOriginalFile(null);
        break;
      case "preview":
        setPreviewFile(null);
        break;
      case "thumbnail":
        setThumbnailFile(null);
        break;
    }
  };

  // Add tag
  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput],
      });
      setTagInput("");
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  // Add color
  const addColor = () => {
    if (colorInput && !formData.colors.includes(colorInput)) {
      setFormData({
        ...formData,
        colors: [...formData.colors, colorInput],
      });
      setColorInput("#000000");
    }
  };

  // Remove color
  const removeColor = (color: string) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((c) => c !== color),
    });
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle toggle switches
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  // Upload wallpaper
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!originalFile || !previewFile || !thumbnailFile) {
      toast({
        title: "Missing files",
        description: "Please upload all required image files",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.name || !formData.author || !formData.resolution || !formData.category) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setUploading(true);
      const wallpaperId = uuidv4();
      
      // Upload images to Firebase Storage
      const uploadFile = async (file: File, path: string): Promise<string> => {
        const fileRef = ref(storage, `wallpapers/${wallpaperId}/${path}`);
        await uploadBytes(fileRef, file);
        return getDownloadURL(fileRef);
      };
      
      const [imageUrl, previewUrl, thumbnailUrl] = await Promise.all([
        uploadFile(originalFile, "original"),
        uploadFile(previewFile, "preview"),
        uploadFile(thumbnailFile, "thumbnail"),
      ]);
      
      // Size calculation in bytes
      const size = originalFile.size;
      
      // Calculate aspect ratio from resolution
      let aspectRatio = 1;
      let orientation = "square";
      
      if (formData.resolution) {
        const [width, height] = formData.resolution.split("x").map(Number);
        if (width && height) {
          aspectRatio = width / height;
          orientation = width > height ? "landscape" : width < height ? "portrait" : "square";
        }
      }
      
      // Create wallpaper document
      const wallpaperData = {
        id: wallpaperId,
        name: formData.name,
        imageUrl,
        previewUrl,
        thumbnailUrl,
        blurHash: "", // Would be generated by a cloud function
        downloads: 0,
        likes: 0,
        views: 0,
        size,
        resolution: formData.resolution,
        aspectRatio,
        orientation,
        category: formData.category,
        collections: formData.collections,
        tags: formData.tags,
        colors: formData.colors,
        author: formData.author,
        authorImage: "", // Would be filled by user profile
        uploadedBy: currentUser?.uid || "",
        description: formData.description,
        isPremium: formData.isPremium,
        isAIgenerated: formData.isAIgenerated,
        status: "pending" as const,
        createdAt: Timestamp.now(),
        license: formData.license,
        hash: wallpaperId, // A proper hash would be generated
      };
      
      await setDoc(doc(db, "wallpapers", wallpaperId), wallpaperData);
      
      toast({
        title: "Upload successful!",
        description: "Your wallpaper has been submitted for approval",
      });
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        author: "",
        resolution: "",
        license: "Standard",
        category: "",
        tags: [],
        colors: [],
        collections: [],
        isPremium: false,
        isAIgenerated: false,
      });
      
      setOriginalFile(null);
      setPreviewFile(null);
      setThumbnailFile(null);
    } catch (error) {
      console.error("Error uploading wallpaper:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your wallpaper. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload New Wallpaper</h1>
        <p className="text-muted-foreground">Add a new wallpaper to the database</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Image Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Image Files</h3>
            
            {/* Original Image */}
            <div className="space-y-2">
              <Label htmlFor="original">Original Image*</Label>
              {!originalFile ? (
                <div className="flex items-center justify-center rounded-md border border-dashed p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <label
                      htmlFor="original"
                      className="mt-2 block cursor-pointer text-sm font-medium text-primary hover:underline"
                    >
                      Choose file
                      <Input
                        id="original"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "original")}
                        required
                      />
                    </label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Upload the full resolution image
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-md border">
                  <img
                    src={URL.createObjectURL(originalFile)}
                    alt="Original"
                    className="mx-auto max-h-[200px] rounded-md object-contain p-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile("original")}
                    className="absolute right-1 top-1 h-6 w-6 rounded-full bg-background/80 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <p className="p-2 text-xs text-muted-foreground">
                    {originalFile.name} ({Math.round(originalFile.size / 1024)} KB)
                  </p>
                </div>
              )}
            </div>
            
            {/* Preview Image */}
            <div className="space-y-2">
              <Label htmlFor="preview">Preview Image*</Label>
              {!previewFile ? (
                <div className="flex items-center justify-center rounded-md border border-dashed p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <label
                      htmlFor="preview"
                      className="mt-2 block cursor-pointer text-sm font-medium text-primary hover:underline"
                    >
                      Choose file
                      <Input
                        id="preview"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "preview")}
                        required
                      />
                    </label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Medium resolution for previews
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-md border">
                  <img
                    src={URL.createObjectURL(previewFile)}
                    alt="Preview"
                    className="mx-auto max-h-[200px] rounded-md object-contain p-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile("preview")}
                    className="absolute right-1 top-1 h-6 w-6 rounded-full bg-background/80 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <p className="p-2 text-xs text-muted-foreground">
                    {previewFile.name} ({Math.round(previewFile.size / 1024)} KB)
                  </p>
                </div>
              )}
            </div>
            
            {/* Thumbnail Image */}
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail Image*</Label>
              {!thumbnailFile ? (
                <div className="flex items-center justify-center rounded-md border border-dashed p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <label
                      htmlFor="thumbnail"
                      className="mt-2 block cursor-pointer text-sm font-medium text-primary hover:underline"
                    >
                      Choose file
                      <Input
                        id="thumbnail"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "thumbnail")}
                        required
                      />
                    </label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Small resolution for thumbnails
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-md border">
                  <img
                    src={URL.createObjectURL(thumbnailFile)}
                    alt="Thumbnail"
                    className="mx-auto max-h-[200px] rounded-md object-contain p-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile("thumbnail")}
                    className="absolute right-1 top-1 h-6 w-6 rounded-full bg-background/80 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <p className="p-2 text-xs text-muted-foreground">
                    {thumbnailFile.name} ({Math.round(thumbnailFile.size / 1024)} KB)
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Metadata Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Wallpaper Details</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name*</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Wallpaper title"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="author">Author*</Label>
                <Input
                  id="author"
                  name="author"
                  placeholder="Creator name"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="resolution">Resolution* (e.g. 1920x1080)</Label>
                <Input
                  id="resolution"
                  name="resolution"
                  placeholder="Width x Height"
                  value={formData.resolution}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category*</Label>
                <Input
                  id="category"
                  name="category"
                  placeholder="e.g. Nature, Abstract"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="license">License</Label>
                <select
                  id="license"
                  name="license"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.license}
                  onChange={handleInputChange}
                >
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                  <option value="CC0">CC0</option>
                  <option value="CC BY">CC BY</option>
                  <option value="CC BY-SA">CC BY-SA</option>
                  <option value="CC BY-ND">CC BY-ND</option>
                </select>
              </div>
              
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the wallpaper"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              
              {/* Tags Input */}
              <div className="space-y-2 sm:col-span-2">
                <Label>Tags</Label>
                <div className="flex">
                  <Input
                    id="tagInput"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="rounded-r-none"
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    className="rounded-l-none"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center rounded-full bg-muted px-3 py-1 text-sm"
                    >
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTag(tag)}
                        className="ml-1 h-5 w-5 rounded-full p-0 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Colors Input */}
              <div className="space-y-2 sm:col-span-2">
                <Label>Colors</Label>
                <div className="flex">
                  <Input
                    id="colorInput"
                    type="color"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    className="h-9 w-12 min-w-[48px] rounded-r-none p-1"
                  />
                  <Button
                    type="button"
                    onClick={addColor}
                    className="rounded-l-none"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.colors.map((color, index) => (
                    <div
                      key={index}
                      className="flex items-center rounded-full bg-muted px-3 py-1 text-sm"
                    >
                      <div
                        className="mr-1 h-3 w-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      {color}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeColor(color)}
                        className="ml-1 h-5 w-5 rounded-full p-0 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Toggles */}
              <div className="space-y-4 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isPremium" className="cursor-pointer">
                    Premium Wallpaper
                  </Label>
                  <Switch
                    id="isPremium"
                    checked={formData.isPremium}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("isPremium", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="isAIgenerated" className="cursor-pointer">
                    AI Generated
                  </Label>
                  <Switch
                    id="isAIgenerated"
                    checked={formData.isAIgenerated}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("isAIgenerated", checked)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={uploading} className="min-w-[150px]">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Wallpaper
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default WallpaperUpload;
