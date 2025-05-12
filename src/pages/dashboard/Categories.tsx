
import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, addDoc, deleteDoc, updateDoc, query, orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Category } from "@/types";
import { search } from "@/lib/search";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Edit, Trash2, Plus, Search, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ITEMS_PER_PAGE = 10;

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    iconUrl: "",
  });

  useEffect(() => {
    fetchCategories(true);
  }, []);

  const fetchCategories = async (isInitial: boolean = false) => {
    try {
      setLoading(true);
      
      if (isInitial) {
        setLastVisible(null);
      }
      
      let q;
      const categoriesCollection = collection(db, "categories");
      
      if (!isInitial && lastVisible) {
        // Fix: Use direct parameters instead of spread operator
        q = query(
          categoriesCollection,
          orderBy("name"),
          startAfter(lastVisible),
          limit(ITEMS_PER_PAGE)
        );
      } else {
        q = query(
          categoriesCollection,
          orderBy("name"),
          limit(ITEMS_PER_PAGE)
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setHasMore(false);
        setLoading(false);
        if (isInitial) {
          setCategories([]);
        }
        return;
      }
      
      const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastVisibleDoc);
      
      const categoriesList = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Category)
      );
      
      if (isInitial) {
        setCategories(categoriesList);
      } else {
        setCategories(prev => [...prev, ...categoriesList]);
      }
      
      setHasMore(querySnapshot.docs.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      const timestamp = new Date();
      const newCategory = {
        name: formData.name,
        description: formData.description,
        iconUrl: formData.iconUrl,
        wallpaperCount: 0,
        createdAt: timestamp
      };

      await addDoc(collection(db, "categories"), newCategory);
      
      toast({
        title: "Success",
        description: "Category added successfully",
      });

      resetForm();
      setIsAddDialogOpen(false);
      fetchCategories(true);
    } catch (error) {
      console.error("Error adding category:", error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = async () => {
    if (!currentCategory) return;

    try {
      await updateDoc(doc(db, "categories", currentCategory.id), {
        name: formData.name,
        description: formData.description,
        iconUrl: formData.iconUrl,
      });

      toast({
        title: "Success",
        description: "Category updated successfully",
      });

      setIsEditDialogOpen(false);
      fetchCategories(true);
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async () => {
    if (!currentCategory) return;

    try {
      await deleteDoc(doc(db, "categories", currentCategory.id));
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      fetchCategories(true);
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (category: Category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      iconUrl: category.iconUrl || ""
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      iconUrl: ""
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      // If search is cleared, reset to normal view
      fetchCategories(true);
      return;
    }
    
    try {
      setLoading(true);
      
      const result = await search<Category>({
        collection: "categories",
        searchTerm: searchTerm.trim(),
        sortField: "name",
        sortDirection: "asc",
        pageSize: ITEMS_PER_PAGE
      });
      
      setCategories(result.items);
      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
      
      if (result.items.length === 0) {
        toast({
          title: "No categories found",
          description: `No categories matching "${searchTerm}" were found.`,
        });
      }
    } catch (error) {
      console.error("Error searching categories:", error);
      toast({
        title: "Search error",
        description: "Failed to search categories. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchTerm("");
    fetchCategories(true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchCategories(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Manage wallpaper categories
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20 backdrop-blur-sm bg-primary/80">
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-white/20 shadow-xl">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Create a new category for wallpapers.
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
                  className="backdrop-blur-sm bg-white/10 border border-white/20"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="iconUrl">Icon URL</Label>
                <Input
                  id="iconUrl"
                  value={formData.iconUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, iconUrl: e.target.value })
                  }
                  placeholder="https://example.com/icon.png"
                  className="backdrop-blur-sm bg-white/10 border border-white/20"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="backdrop-blur-sm bg-white/10 border border-white/20">
                Cancel
              </Button>
              <Button onClick={handleAddCategory} className="shadow-lg shadow-primary/20 backdrop-blur-sm bg-primary/80">Add Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-6">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search categories by name..."
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
          <CardTitle>All Categories</CardTitle>
          <CardDescription>
            A list of all wallpaper categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && categories.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <span className="ml-2">Loading categories...</span>
            </div>
          ) : (
            <div className="rounded-md border border-white/10 overflow-hidden">
              <Table>
                <TableHeader className="bg-primary/5 backdrop-blur-sm">
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Wallpaper Count</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6">
                        No categories found. Add your first category.
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => (
                      <TableRow key={category.id} className="hover:bg-primary/5">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {category.iconUrl ? (
                              <Avatar className="h-8 w-8 border border-white/20 shadow-sm">
                                <AvatarImage src={category.iconUrl} alt={category.name} />
                                <AvatarFallback className="bg-primary/20">{category.name[0]}</AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-medium">{category.name[0]}</span>
                              </div>
                            )}
                            <span className="font-medium">{category.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {category.description || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="bg-primary/10">
                            {category.wallpaperCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditDialog(category)}
                              className="hover:bg-primary/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openDeleteDialog(category)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {hasMore && !loading && (
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={loadMore} 
                className="shadow-lg shadow-primary/10 backdrop-blur-sm bg-primary/80"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Load More Categories"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-white/20 shadow-xl">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Make changes to the category details.
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
              <Label htmlFor="edit-iconUrl">Icon URL</Label>
              <Input
                id="edit-iconUrl"
                value={formData.iconUrl}
                onChange={(e) =>
                  setFormData({ ...formData, iconUrl: e.target.value })
                }
                placeholder="https://example.com/icon.png"
                className="backdrop-blur-sm bg-white/10 border border-white/20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="backdrop-blur-sm bg-white/10 border border-white/20">
              Cancel
            </Button>
            <Button onClick={handleEditCategory} className="shadow-lg shadow-primary/20 backdrop-blur-sm bg-primary/80">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-white/20 shadow-xl">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="backdrop-blur-sm bg-white/10 border border-white/20"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
