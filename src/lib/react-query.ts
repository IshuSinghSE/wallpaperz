
import { QueryClient } from '@tanstack/react-query';
import { Timestamp } from 'firebase/firestore';

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

// Helper function to handle server timestamp in mutations
export const prepareTimestampForFirestore = (data: any): any => {
  // Deep clone to avoid modifying original object
  const result = { ...data };
  
  // Convert Date objects to null for serverTimestamp() to handle
  Object.keys(result).forEach(key => {
    if (result[key] instanceof Date) {
      result[key] = Timestamp.fromDate(result[key]);
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = prepareTimestampForFirestore(result[key]);
    }
  });
  
  return result;
};
