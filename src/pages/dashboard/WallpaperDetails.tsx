
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
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, ArrowUp, ArrowDown, Check, X } from "lucide-react";
import { format } from "date-fns";

const WallpaperDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [wallpaper, setWallpaper] = useState<Wallpaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("thumbnail");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [editedStatus, setEditedStatus] = useState<WallpaperStatus>("pending");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchWallpaper = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const docRef = doc(db, "wallpapers", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Wallpaper;
          setWallpaper(data);
          setEditedName(data.name);
          setEditedDescription(data.description);
          setEditedTags(data.tags);
          setEditedStatus(data.status);
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

  const handleSaveEdit = async () => {
    if (!wallpaper || !id) return;
    
    try {
      await updateDoc(doc(db, "wallpapers", id), {
        name: editedName,
        description: editedDescription,
        tags: editedTags,
      });
      
      setWallpaper({
        ...wallpaper,
        name: editedName,
        description: editedDescription,
        tags: editedTags,
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

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{wallpaper.name}</h1>
          <p className="text-muted-foreground">
            By {wallpaper.author} • Added{" "}
            {wallpaper.createdAt instanceof Date
              ? format(wallpaper.createdAt, "MMM d, yyyy")
              : wallpaper.createdAt?.toDate
              ? format(wallpaper.createdAt.toDate(), "MMM d, yyyy")
              : "Unknown date"}
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
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Wallpaper</DialogTitle>
                <DialogDescription>
                  Make changes to the wallpaper details below.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <input
                    id="name"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="tags" className="text-sm font-medium">
                    Tags (comma separated)
                  </label>
                  <input
                    id="tags"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={editedTags.join(", ")}
                    onChange={(e) => 
                      setEditedTags(e.target.value.split(",").map(tag => tag.trim()).filter(Boolean))
                    }
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </DialogFooter>
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
                      value="preview"
                      className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
                    >
                      Preview
                    </TabsTrigger>
                    <TabsTrigger
                      value="original"
                      className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
                    >
                      Original
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="aspect-[3/4] relative">
                    <TabsContent value="thumbnail" className="m-0 h-full">
                      <img
                        src={wallpaper.thumbnail}
                        alt={wallpaper.name}
                        className="h-full w-full object-cover"
                      />
                    </TabsContent>
                    
                    <TabsContent value="preview" className="m-0 h-full">
                      {currentTab === "preview" && (
                        <img
                          src={wallpaper.previewUrl}
                          alt={wallpaper.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </TabsContent>
                    
                    <TabsContent value="original" className="m-0 h-full">
                      {currentTab === "original" && (
                        <img
                          src={wallpaper.imageUrl}
                          alt={wallpaper.name}
                          className="h-full w-full object-cover"
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
              <div className="space-y-2">
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
                <p className="text-sm font-medium text-muted-foreground">Aspect Ratio</p>
                <p>{wallpaper.aspectRatio.toFixed(2)}</p>
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
                  <p><span className="font-medium">{wallpaper.views}</span> views</p>
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
