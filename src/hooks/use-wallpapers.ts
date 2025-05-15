import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  startAfter,
  where,
  DocumentData,
  QueryDocumentSnapshot,
  DocumentSnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Wallpaper, WallpaperStatus } from "@/types";
import { search } from "@/lib/search";
import { CACHE_KEYS } from "@/lib/cache-keys";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 20;

interface UseWallpapersProps {
  initialStatus?: WallpaperStatus | "all";
  initialCategory?: string;
  pageSize?: number;
}

export const useWallpapers = ({
  initialStatus = "all", 
  initialCategory = "all",
  pageSize = ITEMS_PER_PAGE 
}: UseWallpapersProps = {}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<WallpaperStatus | "all">(initialStatus);
  const [filterCategory, setFilterCategory] = useState<string>(initialCategory);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Build query for fetching wallpapers
  const buildQuery = useCallback((isInitial: boolean = true) => {
    const wallpapersQuery = collection(db, "wallpapers");
    const queryConstraints = [];
    
    if (filterStatus !== "all") {
      queryConstraints.push(where("status", "==", filterStatus));
    }
    
    if (filterCategory !== "all") {
      queryConstraints.push(where("category", "==", filterCategory));
    }
    
    queryConstraints.push(orderBy("createdAt", "desc"));
    queryConstraints.push(limit(pageSize));
    
    if (!isInitial && lastVisible) {
      queryConstraints.push(startAfter(lastVisible));
    }
    
    return query(wallpapersQuery, ...queryConstraints);
  }, [filterStatus, filterCategory, lastVisible, pageSize]);

  // Create query key based on current filters
  const queryKey = CACHE_KEYS.WALLPAPERS.list({
    status: filterStatus,
    category: filterCategory,
    search: searchTerm,
    isSearchMode: Boolean(searchTerm),
  });

  // Main query for wallpapers
  const { 
    data, 
    isLoading, 
    isFetching,
    refetch 
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (searchTerm) {
        // Search mode - use search utility
        const filters: Record<string, any> = {};
        if (filterStatus !== "all") filters.status = filterStatus;
        if (filterCategory !== "all") filters.category = filterCategory;
        
        const result = await search<Wallpaper>({
          collection: "wallpapers",
          searchTerm: searchTerm.trim(),
          filters,
          sortField: "createdAt",
          sortDirection: "desc",
          pageSize
        });
        
        setLastVisible(result.lastVisible);
        setHasMore(result.hasMore);
        
        if (result.items.length === 0) {
          toast({
            title: "No results found",
            description: `No wallpapers matching "${searchTerm}" were found.`,
          });
        }
        
        return result.items;
      } else {
        // Normal mode - use regular query
        const q = buildQuery(true);
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setHasMore(false);
          return [];
        }
        
        const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(lastVisibleDoc);
        
        const wallpaperData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          // Map Firestore field names to our schema field names if needed
          return {
            id: doc.id,
            name: data.name,
            imageUrl: data.image || data.imageUrl,
            thumbnailUrl: data.thumbnail || data.thumbnailUrl,
            downloads: data.downloads || 0,
            likes: data.likes || 0,
            size: data.size || 0,
            resolution: data.resolution || "",
            orientation: data.orientation || "",
            category: data.category || "",
            tags: data.tags || [],
            colors: data.colors || [],
            author: data.author || "",
            authorImage: data.authorImage || "",
            description: data.description || "",
            isPremium: data.isPremium || false,
            isAIgenerated: data.isAIgenerated || false,
            status: data.status || "pending",
            createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            license: data.license || "",
            hash: data.hash || doc.id
          } as Wallpaper;
        });
        
        setHasMore(querySnapshot.docs.length === pageSize);
        return wallpaperData;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Load more function
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    try {
      if (searchTerm) {
        // Search mode - load more search results
        const filters: Record<string, any> = {};
        if (filterStatus !== "all") filters.status = filterStatus;
        if (filterCategory !== "all") filters.category = filterCategory;
        
        const result = await search<Wallpaper>({
          collection: "wallpapers",
          searchTerm: searchTerm.trim(),
          filters,
          sortField: "createdAt",
          sortDirection: "desc",
          pageSize,
          lastVisible
        });
        
        setLastVisible(result.lastVisible);
        setHasMore(result.hasMore);
        
        // Update the cache with combined results
        queryClient.setQueryData(queryKey, (oldData: Wallpaper[] = []) => {
          return [...oldData, ...result.items];
        });
      } else {
        // Normal mode - load more with regular query
        const q = buildQuery(false);
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setHasMore(false);
          return;
        }
        
        const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(lastVisibleDoc);
        
        const newWallpapers = querySnapshot.docs.map(doc => {
          const data = doc.data();
          // Map Firestore field names to our schema field names if needed
          return {
            id: doc.id,
            name: data.name,
            imageUrl: data.image || data.imageUrl,
            thumbnailUrl: data.thumbnail || data.thumbnailUrl,
            downloads: data.downloads || 0,
            likes: data.likes || 0,
            size: data.size || 0,
            resolution: data.resolution || "",
            orientation: data.orientation || "",
            category: data.category || "",
            tags: data.tags || [],
            colors: data.colors || [],
            author: data.author || "",
            authorImage: data.authorImage || "",
            description: data.description || "",
            isPremium: data.isPremium || false,
            isAIgenerated: data.isAIgenerated || false,
            status: data.status || "pending",
            createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            license: data.license || "",
            hash: data.hash || doc.id
          } as Wallpaper;
        });
        
        setHasMore(querySnapshot.docs.length === pageSize);
        
        // Update the cache with combined results
        queryClient.setQueryData(queryKey, (oldData: Wallpaper[] = []) => {
          return [...oldData, ...newWallpapers];
        });
      }
    } catch (error) {
      console.error("Error loading more wallpapers:", error);
      toast({
        title: "Error",
        description: "Failed to load more wallpapers. Please try again later.",
        variant: "destructive"
      });
    }
  }, [
    isLoading, hasMore, searchTerm, filterStatus, filterCategory, 
    lastVisible, pageSize, queryClient, queryKey, toast, buildQuery
  ]);

  const handleSearch = useCallback(async (term: string) => {
    setSearchTerm(term);
    setLastVisible(null);
    setHasMore(true);
    // The search will be triggered by the useQuery hook due to queryKey change
  }, []);

  const resetSearch = useCallback(() => {
    setSearchTerm("");
    setLastVisible(null);
    setHasMore(true);
    // The reset will be triggered by the useQuery hook due to queryKey change
  }, []);

  return {
    wallpapers: data || [],
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
    refresh: refetch,
  };
};
