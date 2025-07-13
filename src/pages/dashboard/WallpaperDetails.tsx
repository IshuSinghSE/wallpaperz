import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Wallpaper, WallpaperStatus } from "@/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, ArrowUp, ArrowDown, Check, X, Download } from '@/lib/icons';
import { format } from "date-fns";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const WallpaperDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [wallpaper, setWallpaper] = useState<Wallpaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("thumbnail");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchWallpaper = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const docRef = doc(db, "wallpapers", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const raw = docSnap.data();
          // Map Firestore fields to Wallpaper model
          const data: Wallpaper = {
            id: docSnap.id,
            name: raw.name || "",
            image: raw.image || raw.imageUrl || "",
            thumbnail: raw.thumbnail || raw.thumbnailUrl || "",
            downloads: raw.downloads || 0,
            likes: raw.likes || 0,
            size: raw.size || 0,
            resolution: raw.resolution || "",
            orientation: raw.orientation || "",
            category: raw.category || "",
            tags: Array.isArray(raw.tags) ? raw.tags : [],
            colors: Array.isArray(raw.colors) ? raw.colors : [],
            author: raw.author || "",
            authorImage: raw.authorImage || "",
            description: raw.description || "",
            isPremium: !!raw.isPremium,
            isAIgenerated: !!raw.isAIgenerated,
            status: raw.status || "pending",
            createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
            license: raw.license || "",
            hash: raw.hash || docSnap.id
          };
          setWallpaper(data);
        } else {
          toast({
            title: "Error",
            description: "Wallpaper not found",
            variant: "destructive",
          });
          navigate("/dashboard/wallpapers");
        }
      } catch (error) {
        console.error("Error fetching wallpaper:", error);
        toast({
          title: "Error",
          description: "Failed to load wallpaper details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWallpaper();
  }, [id, navigate, toast]);

  // Define the form schema
  const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    image: z.string().url("Must be a valid URL"),
    thumbnail: z.string().url("Must be a valid URL"),
    description: z.string().optional(),
    author: z.string().min(1, "Author is required"),
    authorImage: z.string().url("Must be a valid URL"),
    category: z.string().min(1, "Category is required"),
    tags: z.array(z.string()),
    colors: z.array(z.string()),
    resolution: z.string().min(1, "Resolution is required"),
    size: z.number().positive("Size must be positive"),
    orientation: z.string().min(1, "Orientation is required"),
    license: z.string().optional(),
    isPremium: z.boolean(),
    isAIgenerated: z.boolean(),
    hash: z.string().optional(),
    status: z.enum(["pending", "approved", "rejected", "hidden"]),
  });

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: wallpaper?.name || "",
      image: wallpaper?.image || "",
      thumbnail: wallpaper?.thumbnail || "",
      description: wallpaper?.description || "",
      author: wallpaper?.author || "",
      authorImage: wallpaper?.authorImage || "",
      category: wallpaper?.category || "",
      tags: wallpaper?.tags || [],
      colors: wallpaper?.colors || [],
      resolution: wallpaper?.resolution || "",
      size: wallpaper?.size || 0,
      orientation: wallpaper?.orientation || "",
      license: wallpaper?.license || "",
      isPremium: wallpaper?.isPremium || false,
      isAIgenerated: wallpaper?.isAIgenerated || false,
      hash: wallpaper?.hash || "",
      status: wallpaper?.status || "pending",
    }
  });

  // Update form values when wallpaper data is loaded
  useEffect(() => {
    if (wallpaper) {
      form.reset({
        name: wallpaper.name,
        image: wallpaper.image,
        thumbnail: wallpaper.thumbnail,
        description: wallpaper.description,
        author: wallpaper.author,
        authorImage: wallpaper.authorImage,
        category: wallpaper.category,
        tags: wallpaper.tags,
        colors: wallpaper.colors,
        resolution: wallpaper.resolution,
        size: wallpaper.size,
        orientation: wallpaper.orientation,
        license: wallpaper.license,
        isPremium: wallpaper.isPremium,
        isAIgenerated: wallpaper.isAIgenerated,
        hash: wallpaper.hash,
        status: wallpaper.status,
      });
    }
  }, [wallpaper, form]);

  const handleStatusChange = async (newStatus: WallpaperStatus) => {
    if (!wallpaper || !id) return;
    
    try {
      setUpdatingStatus(true);
      await updateDoc(doc(db, "wallpapers", id), {
        status: newStatus
      });
      
      setWallpaper({
        ...wallpaper,
        status: newStatus
      });
      
      toast({
        title: "Status updated",
        description: `Wallpaper status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update wallpaper status",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveEdit = async (data: z.infer<typeof formSchema>) => {
    if (!wallpaper || !id) return;
    
    try {
      await updateDoc(doc(db, "wallpapers", id), {
        ...data,
      });
      
      setWallpaper({
        ...wallpaper,
        ...data,
      });
      
      toast({
        title: "Changes saved",
        description: "Wallpaper details updated successfully",
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating wallpaper:", error);
      toast({
        title: "Error",
        description: "Failed to update wallpaper details",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteDoc(doc(db, "wallpapers", id));
      
      toast({
        title: "Wallpaper deleted",
        description: "The wallpaper has been permanently removed",
      });
      
      navigate("/dashboard/wallpapers");
    } catch (error) {
      console.error("Error deleting wallpaper:", error);
      toast({
        title: "Error",
        description: "Failed to delete wallpaper",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!wallpaper) return;
    
    let downloadUrl = wallpaper.image;
    if (currentTab === "thumbnail") {
      downloadUrl = wallpaper.thumbnail;
    }
    
    // Create a temporary link element and trigger download
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${wallpaper.name}.jpg`; // Assuming jpg, might need to be determined from the URL
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Update download count in Firebase
    if (id) {
      updateDoc(doc(db, "wallpapers", id), {
        downloads: (wallpaper.downloads || 0) + 1
      }).then(() => {
        setWallpaper({
          ...wallpaper,
          downloads: (wallpaper.downloads || 0) + 1
        });
      }).catch(error => {
        console.error("Failed to update download count:", error);
      });
    }
  };

  const getStatusBadgeClass = (status: WallpaperStatus) => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "hidden":
        return "bg-slate-50 text-slate-700 border-slate-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: WallpaperStatus) => {
    switch (status) {
      case "approved":
        return <Check className="h-4 w-4 text-emerald-500" />;
      case "pending":
        return <ArrowUp className="h-4 w-4 text-amber-500" />;
      case "rejected":
        return <X className="h-4 w-4 text-rose-500" />;
      case "hidden":
        return <ArrowDown className="h-4 w-4 text-slate-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <span className="ml-2">Loading wallpaper details...</span>
      </div>
    );
  }

  if (!wallpaper) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-lg font-semibold">Wallpaper not found</p>
        <Button onClick={() => navigate("/dashboard/wallpapers")} className="mt-4">
          Back to Wallpapers
        </Button>
      </div>
    );
  }

  const currentImage = currentTab === "thumbnail" 
    ? wallpaper.thumbnail 
    : wallpaper.image;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{wallpaper.name}</h1>
          <p className="text-muted-foreground">
            By {wallpaper.author} • Added{" "}
            {(() => {
              if (typeof wallpaper.createdAt === "string") {
                const date = new Date(wallpaper.createdAt);
                if (!isNaN(date.getTime())) {
                  return format(date, "MMM d, yyyy");
                }
              }
              return "Unknown date";
            })()}
          </p>
        </div>
        
        <div className="flex gap-2">
          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Wallpaper</DialogTitle>
                <DialogDescription>
                  Make changes to the wallpaper details below.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSaveEdit)} className="space-y-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Wallpaper name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="author"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Author</FormLabel>
                          <FormControl>
                            <Input placeholder="Author name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Original Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="thumbnail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thumbnail URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/thumbnail.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="authorImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Author Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/author.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="nature">Nature</SelectItem>
                              <SelectItem value="architecture">Architecture</SelectItem>
                              <SelectItem value="animals">Animals</SelectItem>
                              <SelectItem value="abstract">Abstract</SelectItem>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="cityscape">Cityscape</SelectItem>
                              <SelectItem value="people">People</SelectItem>
                              <SelectItem value="travel">Travel</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="resolution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resolution</FormLabel>
                          <FormControl>
                            <Input placeholder="1920x1080" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Size (bytes)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="File size in bytes"
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="orientation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Orientation</FormLabel>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select orientation" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="landscape">Landscape</SelectItem>
                              <SelectItem value="portrait">Portrait</SelectItem>
                              <SelectItem value="square">Square</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="license"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License</FormLabel>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select license" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="standard">Standard License</SelectItem>
                              <SelectItem value="cc0">CC0</SelectItem>
                              <SelectItem value="cc-by">CC-BY</SelectItem>
                              <SelectItem value="cc-by-nc">CC-BY-NC</SelectItem>
                              <SelectItem value="commercial">Commercial</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="hidden">Hidden</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hash"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hash</FormLabel>
                          <FormControl>
                            <Input placeholder="Image hash" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe this wallpaper" className="min-h-[100px]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags (comma separated)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="nature, mountains, sunset"
                              value={field.value.join(", ")}
                              onChange={(e) => {
                                const tags = e.target.value
                                  .split(",")
                                  .map(tag => tag.trim())
                                  .filter(Boolean);
                                field.onChange(tags);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="colors"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Colors (hex codes, comma separated)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="#ff0000, #00ff00, #0000ff"
                              value={field.value.join(", ")}
                              onChange={(e) => {
                                const colors = e.target.value
                                  .split(",")
                                  .map(color => color.trim())
                                  .filter(Boolean);
                                field.onChange(colors);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="isPremium"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Premium</FormLabel>
                            <FormDescription>
                              Is this a premium wallpaper?
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isAIgenerated"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>AI Generated</FormLabel>
                            <FormDescription>
                              Was this wallpaper generated by AI?
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          {/* Delete Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Wallpaper</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this wallpaper? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden shadow-md border border-slate-100 dark:border-slate-800">
            <CardContent className="p-0">
              <Tabs defaultValue="thumbnail" value={currentTab} onValueChange={setCurrentTab}>
                <div className="flex flex-col">
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                    <TabsTrigger
                      value="thumbnail"
                      className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
                    >
                      Thumbnail
                    </TabsTrigger>
                    <TabsTrigger
                      value="original"
                      className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
                    >
                      Original
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="relative h-[400px] md:h-[500px] bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800">
                    <TabsContent value="thumbnail" className="m-0 h-full">
                      <img
                        src={wallpaper.thumbnail}
                        alt={wallpaper.name}
                        className="h-full w-full object-contain"
                      />
                    </TabsContent>
                    
                    <TabsContent value="original" className="m-0 h-full">
                      {currentTab === "original" && (
                        <img
                          src={wallpaper.image}
                          alt={wallpaper.name}
                          className="h-full w-full object-contain"
                        />
                      )}
                    </TabsContent>
                    
                    <div className="absolute top-4 right-4">
                      <div
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(
                          wallpaper.status
                        )}`}
                      >
                        {getStatusIcon(wallpaper.status)}
                        <span className="ml-1 capitalize">{wallpaper.status}</span>
                      </div>
                    </div>

                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <Button 
                        onClick={handleDownload}
                        className="bg-white/80 backdrop-blur-sm hover:bg-white/90 text-black"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-1" /> Download
                      </Button>
                    </div>
                  </div>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="shadow-md bg-gradient-to-br from-card to-background/95 backdrop-blur-sm border border-slate-100 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle>Wallpaper Details</CardTitle>
              <CardDescription>
                Information about this wallpaper
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Select
                  disabled={updatingStatus}
                  value={wallpaper.status}
                  onValueChange={(value) => handleStatusChange(value as WallpaperStatus)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Change status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Resolution</p>
                <p>{wallpaper.resolution}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Size</p>
                <p>{(wallpaper.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Orientation</p>
                <p>{wallpaper.orientation}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <p>{wallpaper.category}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">License</p>
                <p>{wallpaper.license || "Standard License"}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">AI Generated</p>
                <p>{wallpaper.isAIgenerated ? "Yes" : "No"}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Premium</p>
                <p>{wallpaper.isPremium ? "Yes" : "No"}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Stats</p>
                <div className="flex gap-4">
                  <p><span className="font-medium">{wallpaper.downloads}</span> downloads</p>
                  <p><span className="font-medium">{wallpaper.likes}</span> likes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4 shadow-md border border-slate-100 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {wallpaper.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {wallpaper.description && (
            <Card className="mt-4 shadow-md border border-slate-100 dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{wallpaper.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <Button variant="outline" onClick={() => navigate("/dashboard/wallpapers")}>
          Back to All Wallpapers
        </Button>
      </div>
    </div>
  );
};

export default WallpaperDetails;
