
import { collection, query, where, orderBy, limit, getDocs, startAfter, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Wallpaper, Collection, Category, User } from "@/types";

// Search index map for optimizing text search
const createSearchableIndex = (text: string): string[] => {
  if (!text) return [];
  
  // Convert to lowercase
  const normalizedText = text.toLowerCase();
  
  // Create n-grams (2 and 3 characters) for partial matching
  const words = normalizedText.split(/\s+/);
  const searchTerms = new Set<string>();
  
  // Add full words
  words.forEach(word => {
    if (word.length > 1) {
      searchTerms.add(word);
    }
  });
  
  // Add bigrams and trigrams for partial matching
  words.forEach(word => {
    if (word.length >= 2) {
      for (let i = 0; i < word.length - 1; i++) {
        searchTerms.add(word.substring(i, i + 2));
        if (i + 3 <= word.length) {
          searchTerms.add(word.substring(i, i + 3));
        }
      }
    }
  });
  
  return Array.from(searchTerms);
};

interface SearchOptions {
  collection: 'wallpapers' | 'categories' | 'collections' | 'users';
  searchTerm: string;
  filters?: Record<string, any>;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  pageSize?: number;
  lastVisible?: QueryDocumentSnapshot<DocumentData> | null;
}

export async function search<T>({
  collection: collectionName,
  searchTerm,
  filters = {},
  sortField = 'createdAt',
  sortDirection = 'desc',
  pageSize = 20,
  lastVisible = null,
}: SearchOptions): Promise<{
  items: T[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}> {
  try {
    const collectionRef = collection(db, collectionName);
    const queryConstraints = [];
    
    // Apply search term if provided
    if (searchTerm) {
      // For more complex search, we'd use searchable indexes
      // Here we're doing a simple contains search on name/title/displayName fields
      
      // Determine field based on collection
      let searchField = "name"; // default for wallpapers and categories
      if (collectionName === "collections") searchField = "name";
      if (collectionName === "users") searchField = "displayName";
      
      // Simple substring search - for production we'd use a proper search index
      // This is a simplified approach
      queryConstraints.push(where(searchField, ">=", searchTerm.toLowerCase()));
      queryConstraints.push(where(searchField, "<=", searchTerm.toLowerCase() + "\uf8ff"));
    }
    
    // Apply any additional filters
    Object.entries(filters).forEach(([field, value]) => {
      if (value !== undefined && value !== null && value !== 'all') {
        queryConstraints.push(where(field, "==", value));
      }
    });
    
    // Add sorting
    queryConstraints.push(orderBy(sortField, sortDirection));
    
    // Apply pagination
    if (lastVisible) {
      queryConstraints.push(startAfter(lastVisible));
    }
    
    queryConstraints.push(limit(pageSize));
    
    const q = query(collectionRef, ...queryConstraints);
    const snapshot = await getDocs(q);
    
    const items = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as T[];
    
    const newLastVisible = snapshot.docs.length > 0 
      ? snapshot.docs[snapshot.docs.length - 1] 
      : null;
    
    const hasMore = snapshot.docs.length === pageSize;
    
    return {
      items,
      lastVisible: newLastVisible,
      hasMore
    };
  } catch (error) {
    console.error(`Error searching ${collectionName}:`, error);
    return {
      items: [],
      lastVisible: null,
      hasMore: false
    };
  }
}

// Helper function to generate tags for wallpapers to improve search
export const generateSearchableTags = (wallpaper: Partial<Wallpaper>): string[] => {
  const searchableTags = new Set<string>();
  
  // Add existing tags
  if (wallpaper.tags && Array.isArray(wallpaper.tags)) {
    wallpaper.tags.forEach(tag => searchableTags.add(tag.toLowerCase()));
  }
  
  // Add name terms
  if (wallpaper.name) {
    const nameTags = createSearchableIndex(wallpaper.name);
    nameTags.forEach(tag => searchableTags.add(tag));
  }
  
  // Add author
  if (wallpaper.author) {
    searchableTags.add(wallpaper.author.toLowerCase());
  }
  
  // Add category
  if (wallpaper.category) {
    searchableTags.add(wallpaper.category.toLowerCase());
  }
  
  // Add description terms if available
  if (wallpaper.description) {
    const descriptionTags = createSearchableIndex(wallpaper.description);
    descriptionTags.forEach(tag => searchableTags.add(tag));
  }
  
  return Array.from(searchableTags);
};
