
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Collection } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Edit, Trash2, Plus, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Collections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCollection, setCurrentCollection] = useState<Collection | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    thumbnailUrl: "",
  });

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "collections"));
      const collectionsList = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Collection)
      );
      setCollections(collectionsList);
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
        thumbnailUrl: formData.thumbnailUrl,
        wallpaperIds: [],
      };

      await addDoc(collection(db, "collections"), newCollection);
      
      toast({
        title: "Success",
        description: "Collection added successfully",
      });

      setFormData({ name: "", description: "", thumbnailUrl: "" });
      setIsAddDialogOpen(false);
      fetchCollections();
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
        thumbnailUrl: formData.thumbnailUrl,
      });

      toast({
        title: "Success",
        description: "Collection updated successfully",
      });

      setIsEditDialogOpen(false);
      fetchCollections();
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
      fetchCollections();
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
      thumbnailUrl: collection.thumbnailUrl || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (collection: Collection) => {
    setCurrentCollection(collection);
    setIsDeleteDialogOpen(true);
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
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
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
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                <Input
                  id="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, thumbnailUrl: e.target.value })
                  }
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCollection}>Create Collection</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Collections</CardTitle>
          <CardDescription>
            Manage your wallpaper collections
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <span className="ml-2">Loading collections...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.length === 0 ? (
                <div className="col-span-full text-center py-10">
                  <p>No collections found. Create your first collection.</p>
                </div>
              ) : (
                collections.map((collection) => (
                  <Card key={collection.id} className="overflow-hidden">
                    <div className="relative h-40 bg-slate-100 dark:bg-slate-800">
                      {collection.thumbnailUrl ? (
                        <img
                          src={collection.thumbnailUrl}
                          alt={collection.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Image className="h-12 w-12 text-slate-400" />
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
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openDeleteDialog(collection)}
                          className="text-destructive hover:text-destructive"
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
        </CardContent>
      </Card>

      {/* Edit Collection Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
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
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-thumbnailUrl">Thumbnail URL</Label>
              <Input
                id="edit-thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnailUrl: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCollection}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Collection Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Collection</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this collection? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
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
