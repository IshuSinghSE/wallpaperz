
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import { Check, X, Edit, Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 20;

const WallpaperList = () => {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [filterStatus, setFilterStatus] = useState<WallpaperStatus | "all">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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
    let wallpapersQuery = collection(db, "wallpapers");
    
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

  const loadMore = () => {
    if (!loading && hasMore) {
      loadWallpapers();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would implement search functionality here
    toast({
      title: "Search not implemented",
      description: "This feature would require a full-text search solution like Algolia or Firebase Extensions.",
    });
  };

  const getStatusBadgeClass = (status: WallpaperStatus) => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-700";
      case "pending":
        return "bg-amber-50 text-amber-700";
      case "rejected":
        return "bg-rose-50 text-rose-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
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
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <div className="flex gap-2">
          <Select
            value={filterStatus}
            onValueChange={(value) => setFilterStatus(value as WallpaperStatus | "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterCategory}
            onValueChange={setFilterCategory}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                <Card key={wallpaper.id} className="overflow-hidden">
                  <div className="aspect-[3/4] relative">
                    <img
                      src={wallpaper.thumbnailUrl}
                      alt={wallpaper.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                          wallpaper.status
                        )}`}
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
                          className="inline-block rounded-full bg-muted px-2 py-1 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {wallpaper.tags.length > 3 && (
                        <span className="inline-block rounded-full bg-muted px-2 py-1 text-xs">
                          +{wallpaper.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between gap-2 p-4 pt-0">
                    <Link
                      to={`/dashboard/wallpapers/${wallpaper.id}`}
                      className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50"
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Link>
                    {wallpaper.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 px-2">
                          <Check className="mr-1 h-4 w-4 text-emerald-500" />{" "}
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 px-2">
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
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
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
                className="min-w-[200px]"
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
