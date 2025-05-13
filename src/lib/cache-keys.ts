
/**
 * Centralized cache keys for React Query
 * This helps prevent typos and makes refactoring easier
 */
export const CACHE_KEYS = {
  WALLPAPERS: {
    all: ['wallpapers'] as const,
    lists: () => [...CACHE_KEYS.WALLPAPERS.all, 'list'] as const,
    list: (filters: Record<string, any>) => 
      [...CACHE_KEYS.WALLPAPERS.lists(), filters] as const,
    details: () => [...CACHE_KEYS.WALLPAPERS.all, 'detail'] as const,
    detail: (id: string) => 
      [...CACHE_KEYS.WALLPAPERS.details(), id] as const,
  },
  COLLECTIONS: {
    all: ['collections'] as const,
    lists: () => [...CACHE_KEYS.COLLECTIONS.all, 'list'] as const,
    list: (filters: Record<string, any>) => 
      [...CACHE_KEYS.COLLECTIONS.lists(), filters] as const,
    details: () => [...CACHE_KEYS.COLLECTIONS.all, 'detail'] as const,
    detail: (id: string) => 
      [...CACHE_KEYS.COLLECTIONS.details(), id] as const,
  },
  CATEGORIES: {
    all: ['categories'] as const,
    lists: () => [...CACHE_KEYS.CATEGORIES.all, 'list'] as const,
    list: (filters: Record<string, any>) => 
      [...CACHE_KEYS.CATEGORIES.lists(), filters] as const,
  },
  DASHBOARD: {
    all: ['dashboard'] as const,
    overview: () => [...CACHE_KEYS.DASHBOARD.all, 'overview'] as const,
  }
};
