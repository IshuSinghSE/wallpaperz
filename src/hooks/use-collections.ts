
import { useState, useEffect } from "react";
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
  QueryDocumentSnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Collection } from "@/types";
import { search } from "@/lib/search";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 12;

export const useCollections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

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
      const collectionRef = collection(db, "collections");
      
      if (!isInitial && lastVisible) {
        // Don't use spread operator, pass parameters directly
        q = query(
          collectionRef,
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(ITEMS_PER_PAGE)
        );
      } else {
        q = query(
          collectionRef,
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
      
      const collectionsList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          wallpaperIds: data.wallpaperIds || [],
          coverImage: data.coverImage,
          createdBy: data.createdBy,
          tags: data.tags,
          type: data.type,
          createdAt: data.createdAt
        } as Collection;
      });
      
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

  const handleSearch = async (searchTerm: string) => {
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

  const addCollection = async (newCollectionData: Partial<Collection>) => {
    try {
      const newCollection = {
        ...newCollectionData,
        wallpaperIds: [],
        createdBy: "admin", // This would normally come from the current user
        createdAt: new Date()
      };

      await addDoc(collection(db, "collections"), newCollection);
      
      toast({
        title: "Success",
        description: "Collection added successfully",
      });
      
      // Refresh collections
      return true;
    } catch (error) {
      console.error("Error adding collection:", error);
      toast({
        title: "Error",
        description: "Failed to add collection",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateCollection = async (id: string, data: Partial<Collection>) => {
    try {
      await updateDoc(doc(db, "collections", id), data);

      toast({
        title: "Success",
        description: "Collection updated successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error updating collection:", error);
      toast({
        title: "Error",
        description: "Failed to update collection",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteCollection = async (id: string) => {
    try {
      await deleteDoc(doc(db, "collections", id));
      toast({
        title: "Success",
        description: "Collection deleted successfully",
      });
      return true;
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast({
        title: "Error",
        description: "Failed to delete collection",
        variant: "destructive",
      });
      return false;
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

  return {
    collections,
    loading,
    hasMore,
    searchTerm,
    setSearchTerm,
    fetchCollections,
    handleSearch,
    addCollection,
    updateCollection,
    deleteCollection,
    resetSearch,
    loadMore
  };
};
