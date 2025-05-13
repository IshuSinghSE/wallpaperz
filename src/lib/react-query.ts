
import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data fresh for 5 minutes before considering it stale
      staleTime: 5 * 60 * 1000,
      // Cache data for 30 minutes before garbage collection
      gcTime: 30 * 60 * 1000,
      // Retry failed queries 1 time before failing
      retry: 1,
      // Don't refetch on window focus by default
      refetchOnWindowFocus: false,
    },
  },
});

// Helper function to safely convert Firestore timestamps
export const convertTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  
  // If timestamp has toDate() method (Firestore Timestamp)
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  // If timestamp is already a Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // If timestamp is a number or string
  return new Date(timestamp);
};
