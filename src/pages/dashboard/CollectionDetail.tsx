import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Collection, Wallpaper } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from '@/lib/icons';
import { useWallpapers } from "@/hooks/use-wallpapers";
import { Badge } from "@/components/ui/badge";
import { EditCollectionDialog, DeleteCollectionDialog } from "@/components/collections/CollectionDialogs";
import { CollectionFormData } from "@/components/collections/CollectionForm";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus } from '@/lib/icons';

const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddWallpaperDialogOpen, setIsAddWallpaperDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CollectionFormData>({
    name: "",
    description: "",
    coverImage: "",
    tags: [],
    type: "manual",
    wallpaperIds: [],
    createdAt: "",
    createdBy: "",
  });
  const [wallpaperSearch, setWallpaperSearch] = useState("");
  const [selectedWallpapers, setSelectedWallpapers] = useState<string[]>([]);

  // Fetch collection details
  useEffect(() => {
    const fetchCollection = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, "collections", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCollection({ id: docSnap.id, ...docSnap.data() } as Collection);
        } else {
          navigate("/dashboard/collections");
        }
      } catch (error) {
        navigate("/dashboard/collections");
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, [id, navigate]);

  // Fetch wallpapers in this collection
  const { wallpapers, isLoading: wallpapersLoading } = useWallpapers();
  const collectionWallpapers = collection
    ? wallpapers.filter(w => collection.wallpaperIds.includes(w.id))
    : [];

  const handleEdit = () => setIsEditDialogOpen(true);
  const handleDelete = () => setIsDeleteDialogOpen(true);

  const handleEditCollection = async () => {
    if (!collection) return;
    // Add your update logic here, e.g. call updateCollection API
    setIsEditDialogOpen(false);
  };

  const handleDeleteCollection = async () => {
    if (!collection) return;
    // Add your delete logic here, e.g. call deleteCollection API
    navigate("/dashboard/collections");
  };

  const openEditDialog = () => {
    if (!collection) return;
    setFormData({
      name: collection.name,
      description: collection.description || "",
      coverImage: collection.coverImage || "",
      tags: collection.tags || [],
      type: (collection.type as "auto" | "manual") || "manual",
      wallpaperIds: collection.wallpaperIds || [],
      createdAt: collection.createdAt || "",
      createdBy: collection.createdBy || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const filteredWallpapers = wallpapers.filter(w =>
    w.name.toLowerCase().includes(wallpaperSearch.toLowerCase()) &&
    (!collection || !collection.wallpaperIds.includes(w.id))
  );

  const handleAddWallpapersToCollection = () => {
    if (!collection) return;
    // Add selectedWallpapers to collection.wallpaperIds and update in DB
    // ...update logic here...
    setIsAddWallpaperDialogOpen(false);
    setSelectedWallpapers([]);
    setWallpaperSearch("");
  };

  const handleWallpaperSelect = (id: string) => {
    setSelectedWallpapers(prev =>
      prev.includes(id) ? prev.filter(wid => wid !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <span className="ml-2">Loading collection details...</span>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-lg font-semibold">Collection not found</p>
        <Button onClick={() => navigate("/dashboard/collections")} className="mt-4">
          Back to Collections
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{collection.name}</h1>
          <p className="text-muted-foreground">{collection.description}</p>
          <div className="flex gap-2 mt-2">
            {collection.tags?.map((tag, i) => (
              <Badge key={i} className="bg-primary/10">{tag}</Badge>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openEditDialog}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" onClick={openDeleteDialog}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>
      {collection.coverImage && (
        <div className="mb-6">
          <img src={collection.coverImage} alt={collection.name} className="w-full max-h-96 object-cover rounded-lg shadow-md" />
        </div>
      )}
      <Card className="shadow-md border border-slate-100 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Wallpapers in this Collection</CardTitle>
          <CardDescription>
            {collectionWallpapers.length} wallpapers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6 items-start justify-center mb-6">
            {/* Existing wallpapers thumbnails (always show, even if empty) */}
            <div className="flex flex-wrap gap-4 items-center">
              {collectionWallpapers.length > 0 ? (
                collectionWallpapers.map(wallpaper => (
                  <div key={wallpaper.id} className="flex flex-col items-center">
                    <div className="relative w-24 h-24 aspect-square rounded-lg overflow-hidden border border-white/20 dark:border-slate-800/50 shadow-md bg-white/10 dark:bg-slate-900/20">
                      <img src={wallpaper.thumbnail} alt={wallpaper.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="mt-1 text-xs text-center max-w-[6rem] truncate" title={wallpaper.name}>{wallpaper.name}</span>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-sm italic px-4 py-8">No wallpapers found in this collection.</div>
              )}
            </div>
            {/* Add/select/upload wallpaper container */}
            <div className="flex flex-col items-center">
              <div className="relative flex items-center justify-center h-24 w-24 aspect-square bg-slate-200 dark:bg-slate-800 rounded-lg border-2 border-dashed border-primary/40 cursor-pointer hover:bg-primary/10 transition-all" onClick={() => setIsAddWallpaperDialogOpen(true)}>
                <Plus className="h-8 w-8 text-primary absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <Button variant="link" size="sm" className="mt-1" onClick={() => navigate("/dashboard/wallpapers/upload")}>Upload New Wallpaper</Button>
            </div>
          </div>
          {wallpapersLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <span className="ml-2">Loading wallpapers...</span>
            </div>
          ) : collectionWallpapers.length === 0 && (
            <div className="text-center py-10">No wallpapers found in this collection.</div>
          )}
          {/* Add Wallpaper Dialog */}
          <Dialog open={isAddWallpaperDialogOpen} onOpenChange={setIsAddWallpaperDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Wallpapers to Collection</DialogTitle>
              </DialogHeader>
              <div className="mb-4">
                <Input
                  placeholder="Search wallpapers by name..."
                  value={wallpaperSearch}
                  onChange={e => setWallpaperSearch(e.target.value)}
                />
              </div>
              <div className="max-h-80 overflow-y-auto grid gap-4 grid-cols-2 md:grid-cols-3">
                {filteredWallpapers.length === 0 ? (
                  <div className="col-span-full text-center text-muted-foreground">No wallpapers found.</div>
                ) : (
                  filteredWallpapers.map(w => (
                    <div
                      key={w.id}
                      className={`relative border rounded-lg overflow-hidden cursor-pointer transition-all aspect-square h-32 w-32 ${selectedWallpapers.includes(w.id) ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => handleWallpaperSelect(w.id)}
                    >
                      <img src={w.thumbnail} alt={w.name} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 flex items-center justify-between">
                        <span className="truncate max-w-[6rem]">{w.name}</span>
                        {selectedWallpapers.includes(w.id) && <span className="ml-2">Selected</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsAddWallpaperDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddWallpapersToCollection} disabled={selectedWallpapers.length === 0}>Add Selected</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      <div className="mt-4">
        <Button variant="outline" onClick={() => navigate("/dashboard/collections")}>Back to All Collections</Button>
      </div>
      {/* Edit Collection Dialog */}
      <EditCollectionDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        onFormChange={setFormData}
        onEditCollection={handleEditCollection}
      />
      {/* Delete Collection Dialog */}
      <DeleteCollectionDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        collection={collection}
        onDeleteCollection={handleDeleteCollection}
      />
    </div>
  );
};

export default CollectionDetail;
