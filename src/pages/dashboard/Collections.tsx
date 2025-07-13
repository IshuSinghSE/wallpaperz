import React, { useState } from "react";
import { Collection } from "@/types";
import { useCollections } from "@/hooks/use-collections";
import { Search, X, Plus, Loader2 } from '@/lib/icons';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CollectionCard from "@/components/collections/CollectionCard";
import { 
  AddCollectionDialog, 
  EditCollectionDialog, 
  DeleteCollectionDialog 
} from "@/components/collections/CollectionDialogs";
import { CollectionFormData } from "@/components/collections/CollectionForm";
import { RefreshButton } from "@/components/ui/refresh-button";

const Collections = () => {
  const { 
    collections, 
    loading, 
    isFetching,
    hasMore, 
    searchTerm, 
    setSearchTerm,
    handleSearch,
    addCollection,
    updateCollection,
    deleteCollection,
    resetSearch,
    loadMore,
    fetchCollections
  } = useCollections();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCollection, setCurrentCollection] = useState<Collection | null>(null);
  
type ExtendedCollectionFormData = {
  name: string;
  description: string;
  coverImage: string;
  tags: string[];
  type: "auto" | "manual";
  wallpaperIds: string[];
  createdAt: string;
  createdBy: string;
};

const [formData, setFormData] = useState<ExtendedCollectionFormData>({
  name: "",
  description: "",
  coverImage: "",
  tags: [],
  type: "manual",
  wallpaperIds: [],
  createdAt: "",
  createdBy: "",
});

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      coverImage: "",
      tags: [],
      type: "manual",
      wallpaperIds: [],
      createdAt: "",
      createdBy: "",
    });
  };

  const openEditDialog = (collection: Collection) => {
    setCurrentCollection(collection);
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

  const openDeleteDialog = (collection: Collection) => {
    setCurrentCollection(collection);
    setIsDeleteDialogOpen(true);
  };

  const handleAddCollection = async () => {
    try {
      await addCollection({
        name: formData.name,
        description: formData.description,
        coverImage: formData.coverImage,
        tags: formData.tags,
        type: formData.type,
        wallpaperIds: formData.wallpaperIds,
        createdAt: new Date().toISOString(),
        createdBy: formData.createdBy || "admin",
      });
      resetForm();
      setIsAddDialogOpen(false);
      await fetchCollections(true);
    } catch (error) {
      console.error("Error adding collection:", error);
    }
  };

  const handleEditCollection = async () => {
    if (!currentCollection) return;

    try {
      await updateCollection(currentCollection.id, {
        name: formData.name,
        description: formData.description,
        coverImage: formData.coverImage,
        tags: formData.tags,
        type: formData.type,
        wallpaperIds: formData.wallpaperIds,
        createdAt: formData.createdAt,
        createdBy: formData.createdBy,
      });
      setIsEditDialogOpen(false);
      await fetchCollections(true);
    } catch (error) {
      console.error("Error updating collection:", error);
    }
  };

  const handleDeleteCollection = async () => {
    if (!currentCollection) return;

    try {
      await deleteCollection(currentCollection.id);
      setIsDeleteDialogOpen(false);
      await fetchCollections(true);
    } catch (error) {
      console.error("Error deleting collection:", error);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const handleRefresh = () => {
    fetchCollections(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Collections</h1>
          <p className="text-muted-foreground">
            Curated groups of wallpapers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RefreshButton 
            onClick={handleRefresh} 
            isLoading={isFetching} 
          />

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="glassmorphism shadow-lg shadow-primary/20 backdrop-blur-sm">
                <Plus className="mr-2 h-4 w-4" /> Add Collection
              </Button>
            </DialogTrigger>
            <AddCollectionDialog 
              isOpen={isAddDialogOpen}
              onOpenChange={setIsAddDialogOpen}
              formData={formData}
              onFormChange={setFormData}
              onAddCollection={handleAddCollection}
            />
          </Dialog>
        </div>
      </div>

      <div className="relative mb-6">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search collections by name or description..."
            className="pl-10 glassmorphism bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 shadow-lg"
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

      <Card className="glassmorphism card-gradient border-white/20 dark:border-white/10 shadow-xl">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.length === 0 ? (
                <div className="col-span-full text-center py-10">
                  <p>No collections found. Create your first collection.</p>
                </div>
              ) : (
                collections.map((collection) => (
                  <CollectionCard 
                    key={collection.id} 
                    collection={collection} 
                    onEdit={openEditDialog}
                    onDelete={openDeleteDialog}
                  />
                ))
              )}
            </div>
          )}

          {hasMore && !loading && (
            <div className="mt-8 flex justify-center">
              <Button 
                onClick={loadMore} 
                className="glassmorphism shadow-lg shadow-primary/10"
              >
                {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Load More Collections"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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
        collection={currentCollection}
        onDeleteCollection={handleDeleteCollection}
      />
    </div>
  );
};

export default Collections;
