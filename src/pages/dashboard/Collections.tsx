import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  DocumentData,
  QueryDocumentSnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Collection } from "@/types";
import { search } from "@/lib/search";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, Plus, Image, Search, Filter, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const ITEMS_PER_PAGE = 12;

const Collections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCollection, setCurrentCollection] = useState<Collection | null>(null);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    coverImage: "",
    tags: [] as string[],
    type: "manual" as "manual" | "auto",
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    fetchCollections(true);
  }, []);

  const fetchCollections = async (isInitial: boolean = false) => {
    try {
      setLoading(true);
      
      if (isInitial) {
        setLastVisible(null);
      }
      
      let q;
      
      if (!isInitial && lastVisible) {
        q = query(
          collection(db, "collections"),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(ITEMS_PER_PAGE)
        );
      } else {
        q = query(
          collection(db, "collections"),
          orderBy("createdAt", "desc"),
          limit(ITEMS_PER_PAGE)
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setHasMore(false);
        setLoading(false);
        if (isInitial) {
          setCollections([]);
        }
        return;
      }
      
      const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastVisibleDoc);
      
      const collectionsList = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Collection)
      );
      
      if (isInitial) {
        setCollections(collectionsList);
      } else {
        setCollections(prev => [...prev, ...collectionsList]);
      }
      
      setHasMore(querySnapshot.docs.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching collections:", error);
      toast({
        title: "Error",
        description: "Failed to load collections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollection = async () => {
    try {
      const newCollection = {
        name: formData.name,
        description: formData.description,
        coverImage: formData.coverImage,
        wallpaperIds: [],
        tags: formData.tags,
        type: formData.type,
        createdBy: "admin", // This would normally come from the current user
        createdAt: new Date()
      };

      await addDoc(collection(db, "collections"), newCollection);
      
      toast({
        title: "Success",
        description: "Collection added successfully",
      });

      resetForm();
      setIsAddDialogOpen(false);
      fetchCollections(true);
    } catch (error) {
      console.error("Error adding collection:", error);
      toast({
        title: "Error",
        description: "Failed to add collection",
        variant: "destructive",
      });
    }
  };

  const handleEditCollection = async () => {
    if (!currentCollection) return;

    try {
      await updateDoc(doc(db, "collections", currentCollection.id), {
        name: formData.name,
        description: formData.description,
        coverImage: formData.coverImage,
        tags: formData.tags,
        type: formData.type
      });

      toast({
        title: "Success",
        description: "Collection updated successfully",
      });

      setIsEditDialogOpen(false);
      fetchCollections(true);
    } catch (error) {
      console.error("Error updating collection:", error);
      toast({
        title: "Error",
        description: "Failed to update collection",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCollection = async () => {
    if (!currentCollection) return;

    try {
      await deleteDoc(doc(db, "collections", currentCollection.id));
      toast({
        title: "Success",
        description: "Collection deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      fetchCollections(true);
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast({
        title: "Error",
        description: "Failed to delete collection",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (collection: Collection) => {
    setCurrentCollection(collection);
    setFormData({
      name: collection.name,
      description: collection.description || "",
      coverImage: collection.coverImage || "",
      tags: collection.tags || [],
      type: collection.type || "manual",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (collection: Collection) => {
    setCurrentCollection(collection);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      coverImage: "",
      tags: [],
      type: "manual"
    });
    setTagInput("");
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      // If search is cleared, reset to normal view
      fetchCollections(true);
      return;
    }
    
    try {
      setLoading(true);
      
      const result = await search<Collection>({
        collection: "collections",
        searchTerm: searchTerm.trim(),
        sortField: "createdAt",
        sortDirection: "desc",
        pageSize: ITEMS_PER_PAGE
      });
      
      setCollections(result.items);
      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
      
      if (result.items.length === 0) {
        toast({
          title: "No collections found",
          description: `No collections matching "${searchTerm}" were found.`,
        });
      }
    } catch (error) {
      console.error("Error searching collections:", error);
      toast({
        title: "Search error",
        description: "Failed to search collections. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchTerm("");
    fetchCollections(true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchCollections(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Collections</h1>
          <p className="text-muted-foreground">
            Curated groups of wallpapers
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20 backdrop-blur-sm bg-primary/80">
              <Plus className="mr-2 h-4 w-4" /> Add Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-white/20 shadow-xl">
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
              <DialogDescription>
                Create a new collection to group related wallpapers.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Collection name"
                  className="backdrop-blur-sm bg-white/10 border border-white/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe this collection"
                  className="backdrop-blur-sm bg-white/10 border border-white/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="coverImage">Cover Image URL</Label>
                <Input
                  id="coverImage"
                  value={formData.coverImage}
                  onChange={(e) =>
                    setFormData({ ...formData, coverImage: e.target.value })
                  }
                  placeholder="https://example.com/cover-image.jpg"
                  className="backdrop-blur-sm bg-white/10 border border-white/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Collection Type</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="auto-type"
                    checked={formData.type === "auto"}
                    onCheckedChange={(checked) => {
                      setFormData({ ...formData, type: checked ? "auto" : "manual" })
                    }}
                  />
                  <Label htmlFor="auto-type">Auto-populated collection</Label>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tagInput"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tags"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="backdrop-blur-sm bg-white/10 border border-white/20"
                  />
                  <Button type="button" onClick={handleAddTag} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} className="px-2 py-1 gap-1">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="backdrop-blur-sm bg-white/10 border border-white/20">
                Cancel
              </Button>
              <Button onClick={handleAddCollection} className="shadow-lg shadow-primary/20 backdrop-blur-sm bg-primary/80">Create Collection</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-6">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search collections by name or description..."
            className="pl-10 backdrop-blur-sm bg-white/10 border border-white/20 shadow-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-1/2 -translate-y-1/2" 
              onClick={resetSearch}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </form>
      </div>

      <Card className="backdrop-blur-sm bg-white/10 border border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle>All Collections</CardTitle>
          <CardDescription>
            Manage your wallpaper collections
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && collections.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <span className="ml-2">Loading collections...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.length === 0 ? (
                <div className="col-span-full text-center py-10">
                  <p>No collections found. Create your first collection.</p>
                </div>
              ) : (
                collections.map((collection) => (
                  <Card key={collection.id} className="overflow-hidden backdrop-blur-sm bg-white/5 border border-white/10 shadow-xl transition-all hover:shadow-2xl hover:shadow-primary/5 group">
                    <div className="relative h-40 bg-slate-100 dark:bg-slate-800 group-hover:opacity-90 transition-opacity">
                      {collection.coverImage ? (
                        <img
                          src={collection.coverImage}
                          alt={collection.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Image className="h-12 w-12 text-slate-400" />
                        </div>
                      )}
                      {collection.type === "auto" && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-primary/70">Auto</Badge>
                        </div>
                      )}
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">{collection.name}</CardTitle>
                      {collection.description && (
                        <CardDescription className="line-clamp-2">
                          {collection.description}
                        </CardDescription>
                      )}
                      {collection.tags && collection.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {collection.tags.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="inline-block rounded-full bg-primary/10 backdrop-blur-sm px-2 py-0.5 text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {collection.tags.length > 3 && (
                            <span className="inline-block rounded-full bg-primary/10 backdrop-blur-sm px-2 py-0.5 text-xs">
                              +{collection.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </CardHeader>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <div>
                        <span className="text-sm text-muted-foreground">
                          {collection.wallpaperIds?.length || 0} wallpapers
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditDialog(collection)}
                          className="hover:bg-primary/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openDeleteDialog(collection)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          )}

          {hasMore && !loading && (
            <div className="mt-8 flex justify-center">
              <Button 
                onClick={loadMore} 
                className="shadow-lg shadow-primary/10 backdrop-blur-sm bg-primary/80"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Load More Collections"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Collection Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-white/20 shadow-xl">
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
            <DialogDescription>
              Make changes to the collection details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="backdrop-blur-sm bg-white/10 border border-white/20"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="backdrop-blur-sm bg-white/10 border border-white/20"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-coverImage">Cover Image URL</Label>
              <Input
                id="edit-coverImage"
                value={formData.coverImage}
                onChange={(e) =>
                  setFormData({ ...formData, coverImage: e.target.value })
                }
                className="backdrop-blur-sm bg-white/10 border border-white/20"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Collection Type</Label>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="edit-auto-type"
                  checked={formData.type === "auto"}
                  onCheckedChange={(checked) => {
                    setFormData({ ...formData, type: checked ? "auto" : "manual" })
                  }}
                />
                <Label htmlFor="edit-auto-type">Auto-populated collection</Label>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-tagInput"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="backdrop-blur-sm bg-white/10 border border-white/20"
                />
                <Button type="button" onClick={handleAddTag} size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} className="px-2 py-1 gap-1">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="backdrop-blur-sm bg-white/10 border border-white/20">
              Cancel
            </Button>
            <Button onClick={handleEditCollection} className="shadow-lg shadow-primary/20 backdrop-blur-sm bg-primary/80">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Collection Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-white/20 shadow-xl">
          <DialogHeader>
            <DialogTitle>Delete Collection</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this collection? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="backdrop-blur-sm bg-white/10 border border-white/20">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCollection}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Collections;
