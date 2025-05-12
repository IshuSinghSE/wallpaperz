
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  DocumentData,
  QueryDocumentSnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Wallpaper, WallpaperStatus } from "@/types";
import { search } from "@/lib/search";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Check, X, Edit, Loader2, Search, Download, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const ITEMS_PER_PAGE = 20;

const WallpaperList = () => {
  const navigate = useNavigate();
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [filterStatus, setFilterStatus] = useState<WallpaperStatus | "all">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesQuery = query(collection(db, "categories"));
        const categoriesSnapshot = await getDocs(categoriesQuery);
        const categoriesData = categoriesSnapshot.docs.map(doc => doc.data().name);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Error fetching categories",
          description: "Could not load categories. Please try again later.",
          variant: "destructive"
        });
      }
    };

    fetchCategories();
  }, [toast]);

  useEffect(() => {
    setWallpapers([]);
    setLastVisible(null);
    setHasMore(true);
    loadWallpapers(true);
  }, [filterStatus, filterCategory]);

  const buildQuery = (isInitial: boolean = true) => {
    const wallpapersQuery = collection(db, "wallpapers");
    
    const queryConstraints = [];
    
    if (filterStatus !== "all") {
      queryConstraints.push(where("status", "==", filterStatus));
    }
    
    if (filterCategory !== "all") {
      queryConstraints.push(where("category", "==", filterCategory));
    }
    
    queryConstraints.push(orderBy("createdAt", "desc"));
    queryConstraints.push(limit(ITEMS_PER_PAGE));
    
    if (!isInitial && lastVisible) {
      queryConstraints.push(startAfter(lastVisible));
    }
    
    return query(wallpapersQuery, ...queryConstraints);
  };

  const loadWallpapers = async (isInitial: boolean = false) => {
    try {
      setLoading(true);
      
      const q = buildQuery(isInitial);
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setHasMore(false);
        setLoading(false);
        return;
      }
      
      const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastVisibleDoc);
      
      const wallpaperData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Wallpaper[];
      
      if (isInitial) {
        setWallpapers(wallpaperData);
      } else {
        setWallpapers(prev => [...prev, ...wallpaperData]);
      }
      
      setHasMore(querySnapshot.docs.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error("Error loading wallpapers:", error);
      toast({
        title: "Error loading wallpapers",
        description: "Could not load wallpapers. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      // If search is cleared, reset to normal view
      setWallpapers([]);
      setLastVisible(null);
      setHasMore(true);
      loadWallpapers(true);
      return;
    }
    
    try {
      setIsSearching(true);
      setLoading(true);

      // Use our search utility
      const filters: Record<string, any> = {};
      if (filterStatus !== "all") filters.status = filterStatus;
      if (filterCategory !== "all") filters.category = filterCategory;
      
      const result = await search<Wallpaper>({
        collection: "wallpapers",
        searchTerm: searchTerm.trim(),
        filters,
        sortField: "createdAt",
        sortDirection: "desc",
        pageSize: ITEMS_PER_PAGE
      });
      
      setWallpapers(result.items);
      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
      
      if (result.items.length === 0) {
        toast({
          title: "No results found",
          description: `No wallpapers matching "${searchTerm}" were found.`,
        });
      }
    } catch (error) {
      console.error("Error searching wallpapers:", error);
      toast({
        title: "Search error",
        description: "Failed to search wallpapers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleSearchMoreResults = async () => {
    if (!searchTerm.trim() || !lastVisible || !hasMore || loading) return;
    
    try {
      setLoading(true);
      
      // Use our search utility with lastVisible for pagination
      const filters: Record<string, any> = {};
      if (filterStatus !== "all") filters.status = filterStatus;
      if (filterCategory !== "all") filters.category = filterCategory;
      
      const result = await search<Wallpaper>({
        collection: "wallpapers",
        searchTerm: searchTerm.trim(),
        filters,
        sortField: "createdAt",
        sortDirection: "desc",
        pageSize: ITEMS_PER_PAGE,
        lastVisible
      });
      
      setWallpapers(prev => [...prev, ...result.items]);
      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Error searching more wallpapers:", error);
      toast({
        title: "Error",
        description: "Failed to load more search results.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      if (searchTerm.trim()) {
        handleSearchMoreResults();
      } else {
        loadWallpapers();
      }
    }
  };

  const handleViewWallpaper = (id: string) => {
    navigate(`/dashboard/wallpapers/${id}`);
  };

  const getStatusBadgeClass = (status: WallpaperStatus) => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-700";
      case "pending":
        return "bg-amber-50 text-amber-700";
      case "rejected":
        return "bg-rose-50 text-rose-700";
      case "hidden":
        return "bg-gray-50 text-gray-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const resetSearch = () => {
    setSearchTerm("");
    setWallpapers([]);
    setLastVisible(null);
    setHasMore(true);
    loadWallpapers(true);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Wallpapers</h1>
        <p className="text-muted-foreground">Manage your wallpaper collection</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, tag, or author..."
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

        <div className="flex gap-2">
          <div className="relative group">
            <Select
              value={filterStatus}
              onValueChange={(value) => setFilterStatus(value as WallpaperStatus | "all")}
            >
              <SelectTrigger className="w-[180px] backdrop-blur-sm bg-white/10 border border-white/20 shadow-lg">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-white/20">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Badge className="bg-primary/80 text-xs">Status</Badge>
            </div>
          </div>

          <div className="relative group">
            <Select
              value={filterCategory}
              onValueChange={setFilterCategory}
            >
              <SelectTrigger className="w-[180px] backdrop-blur-sm bg-white/10 border border-white/20 shadow-lg">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-white/20">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Badge className="bg-primary/80 text-xs">Category</Badge>
            </div>
          </div>
        </div>
      </div>

      {loading && wallpapers.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading wallpapers...</span>
        </div>
      ) : (
        <>
          {wallpapers.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {wallpapers.map((wallpaper) => (
                <Card 
                  key={wallpaper.id} 
                  className="overflow-hidden shadow-xl border border-white/20 dark:border-slate-800/50 backdrop-blur-sm bg-white/10 dark:bg-slate-900/20 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 cursor-pointer"
                  onClick={() => handleViewWallpaper(wallpaper.id)}
                >
                  <div className="aspect-[3/4] relative">
                    <img
                      src={wallpaper.thumbnail}
                      alt={wallpaper.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                          wallpaper.status
                        )} shadow-md`}
                      >
                        {wallpaper.status}
                      </span>
                    </div>
                  </div>
                  <CardHeader className="p-4 pb-0">
                    <CardTitle className="text-lg">{wallpaper.name}</CardTitle>
                    <CardDescription className="line-clamp-1">
                      By {wallpaper.author}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {wallpaper.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="inline-block rounded-full bg-primary/10 backdrop-blur-sm px-2 py-1 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {wallpaper.tags.length > 3 && (
                        <span className="inline-block rounded-full bg-primary/10 backdrop-blur-sm px-2 py-1 text-xs">
                          +{wallpaper.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2 p-4 pt-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewWallpaper(wallpaper.id);
                      }}
                      className="inline-flex h-9 items-center justify-center rounded-md bg-primary/80 backdrop-blur-sm px-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary focus-visible:outline-none focus-visible:ring-1"
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    {wallpaper.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 px-2 shadow-md backdrop-blur-sm bg-white/10 border-white/20">
                          <Check className="mr-1 h-4 w-4 text-emerald-500" />{" "}
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 px-2 shadow-md backdrop-blur-sm bg-white/10 border-white/20">
                          <X className="mr-1 h-4 w-4 text-rose-500" />{" "}
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-white/20 backdrop-blur-sm bg-white/5 dark:bg-slate-900/10">
              <p className="text-muted-foreground">No wallpapers found</p>
              <p className="text-sm text-muted-foreground">
                Try changing your filters or upload a new wallpaper
              </p>
            </div>
          )}

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button
                onClick={loadMore}
                disabled={loading}
                className="min-w-[200px] shadow-lg shadow-primary/10 backdrop-blur-sm bg-primary/80"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WallpaperList;
