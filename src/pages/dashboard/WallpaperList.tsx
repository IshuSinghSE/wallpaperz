import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Check, X, Edit, Loader2, Search, RefreshCw } from '@/lib/icons';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useWallpapers } from "@/hooks/use-wallpapers";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const WallpaperList = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const { toast } = useToast();

  const { 
    wallpapers, 
    isLoading, 
    isFetching,
    hasMore, 
    filterStatus, 
    setFilterStatus, 
    filterCategory, 
    setFilterCategory, 
    searchTerm, 
    setSearchTerm,
    handleSearch,
    resetSearch,
    loadMore,
    refresh
  } = useWallpapers();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const categoriesQuery = collection(db, "categories");
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
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [toast]);

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

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Wallpapers</h1>
          <p className="text-muted-foreground">Manage your wallpaper collection</p>
        </div>
        <Button 
          onClick={() => refresh()} 
          size="sm" 
          variant="outline" 
          disabled={isFetching}
          className="backdrop-blur-sm bg-white/10 border-white/20 shadow-lg"
        >
          {isFetching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <form onSubmit={onSubmitSearch} className="relative flex-1">
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
              disabled={isLoading}
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
              disabled={isLoading || isLoadingCategories}
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

      {isLoading && wallpapers.length === 0 ? (
        <WallpaperGridSkeleton />
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
                          wallpaper.status as WallpaperStatus
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
                disabled={isFetching}
                className="min-w-[200px] shadow-lg shadow-primary/10 backdrop-blur-sm bg-primary/80"
              >
                {isFetching ? (
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

// Loading skeleton for wallpaper grid
const WallpaperGridSkeleton = () => {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Loading wallpapers...</span>
    </div>
  );
};

export default WallpaperList;
