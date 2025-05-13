
import { useState, useCallback } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  DocumentData,
  QueryDocumentSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Collection } from "@/types";
import { search } from "@/lib/search";
import { useToast } from "@/hooks/use-toast";
import { CACHE_KEYS } from "@/lib/cache-keys";
import { convertTimestamp } from "@/lib/react-query";

const ITEMS_PER_PAGE = 12;

export const useCollections = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Query key based on search term
  const queryKey = CACHE_KEYS.COLLECTIONS.list({ search: searchTerm });

  // Main query for collections data
  const { 
    data: collections = [],
    isLoading,
    isFetching, 
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (searchTerm) {
        // Search mode
        const result = await search<Collection>({
          collection: "collections",
          searchTerm: searchTerm.trim(),
          sortField: "createdAt",
          sortDirection: "desc",
          pageSize: ITEMS_PER_PAGE
        });
        
        setLastVisible(result.lastVisible);
        setHasMore(result.hasMore);
        
        if (result.items.length === 0) {
          toast({
            title: "No collections found",
            description: `No collections matching "${searchTerm}" were found.`,
          });
        }
        
        return result.items;
      } else {
        // Normal fetch mode
        const collectionRef = collection(db, "collections");
        const q = query(
          collectionRef,
          orderBy("createdAt", "desc"),
          limit(ITEMS_PER_PAGE)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setHasMore(false);
          return [];
        }
        
        const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(lastVisibleDoc);
        
        const collectionsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as DocumentData
        })) as Collection[];
        
        setHasMore(querySnapshot.docs.length === ITEMS_PER_PAGE);
        return collectionsList;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Add collection mutation
  const addCollectionMutation = useMutation({
    mutationFn: async (newCollectionData: Partial<Collection>) => {
      const newCollection = {
        ...newCollectionData,
        wallpaperIds: [],
        createdBy: "admin", // This would normally come from the current user
        createdAt: serverTimestamp() // Use Firestore serverTimestamp instead of new Date()
      };

      const docRef = await addDoc(collection(db, "collections"), newCollection);
      return { id: docRef.id, ...newCollection } as Collection;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Collection added successfully",
      });
      // Invalidate cache to trigger a refetch
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.COLLECTIONS.all });
    },
    onError: (error) => {
      console.error("Error adding collection:", error);
      toast({
        title: "Error",
        description: "Failed to add collection",
        variant: "destructive",
      });
    }
  });

  // Update collection mutation
  const updateCollectionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Collection> }) => {
      await updateDoc(doc(db, "collections", id), data);
      return { id, ...data };
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "Collection updated successfully",
      });
      // Update the cache optimistically
      queryClient.setQueryData(queryKey, (old: Collection[] = []) => 
        old.map(item => 
          item.id === variables.id ? { ...item, ...variables.data } : item
        )
      );
    },
    onError: (error) => {
      console.error("Error updating collection:", error);
      toast({
        title: "Error",
        description: "Failed to update collection",
        variant: "destructive",
      });
    }
  });

  // Delete collection mutation
  const deleteCollectionMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "collections", id));
      return id;
    },
    onSuccess: (id) => {
      toast({
        title: "Success",
        description: "Collection deleted successfully",
      });
      // Update the cache optimistically
      queryClient.setQueryData(queryKey, (old: Collection[] = []) => 
        old.filter(item => item.id !== id)
      );
    },
    onError: (error) => {
      console.error("Error deleting collection:", error);
      toast({
        title: "Error",
        description: "Failed to delete collection",
        variant: "destructive",
      });
    }
  });

  // Load more function
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !lastVisible) return;
    
    try {
      if (searchTerm) {
        // Search mode - load more search results
        const result = await search<Collection>({
          collection: "collections",
          searchTerm: searchTerm.trim(),
          sortField: "createdAt",
          sortDirection: "desc",
          pageSize: ITEMS_PER_PAGE,
          lastVisible
        });
        
        setLastVisible(result.lastVisible);
        setHasMore(result.hasMore);
        
        // Update the cache with combined results
        queryClient.setQueryData(queryKey, (oldData: Collection[] = []) => {
          return [...oldData, ...result.items];
        });
      } else {
        // Normal mode - load more with regular query
        const collectionRef = collection(db, "collections");
        const q = query(
          collectionRef,
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(ITEMS_PER_PAGE)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setHasMore(false);
          return;
        }
        
        const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(lastVisibleDoc);
        
        const newCollections = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as DocumentData
        })) as Collection[];
        
        setHasMore(querySnapshot.docs.length === ITEMS_PER_PAGE);
        
        // Update the cache with combined results
        queryClient.setQueryData(queryKey, (oldData: Collection[] = []) => {
          return [...oldData, ...newCollections];
        });
      }
    } catch (error) {
      console.error("Error loading more collections:", error);
      toast({
        title: "Error",
        description: "Failed to load more collections. Please try again.",
        variant: "destructive"
      });
    }
  }, [isLoading, hasMore, lastVisible, searchTerm, queryClient, queryKey, toast]);

  // Handle search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setLastVisible(null);
    setHasMore(true);
    // The actual search will be triggered by the useQuery hook due to queryKey change
  }, []);

  // Reset search
  const resetSearch = useCallback(() => {
    setSearchTerm("");
    setLastVisible(null);
    setHasMore(true);
    // The reset will be triggered by the useQuery hook due to queryKey change
  }, []);

  // Fetch collections function - explicitly returning a Promise
  const fetchCollectionsData = useCallback(async (resetData = false) => {
    if (resetData) {
      setLastVisible(null);
      setHasMore(true);
    }
    return await refetch();
  }, [refetch]);

  return {
    collections,
    loading: isLoading,
    isFetching,
    hasMore,
    searchTerm,
    setSearchTerm,
    handleSearch,
    addCollection: async (newCollectionData: Partial<Collection>) => {
      await addCollectionMutation.mutateAsync(newCollectionData);
      return true;
    },
    updateCollection: async (id: string, data: Partial<Collection>) => {
      await updateCollectionMutation.mutateAsync({ id, data });
      return true;
    },
    deleteCollection: async (id: string) => {
      await deleteCollectionMutation.mutateAsync(id);
      return true;
    },
    resetSearch,
    loadMore,
    fetchCollections: fetchCollectionsData,
    refresh: refetch,
  };
};
