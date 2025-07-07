
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
export const convertTimestamp = (
  timestamp: Timestamp | Date | number | string | null | undefined
): Date => {
  if (!timestamp) return new Date();
  
  // If timestamp is a Firestore Timestamp
  if (
    typeof timestamp === 'object' &&
    timestamp !== null &&
    'toDate' in timestamp &&
    typeof (timestamp as Timestamp).toDate === 'function'
  ) {
    return (timestamp as Timestamp).toDate();
  }
  
  // If timestamp is already a Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // If timestamp is a number or string
  if (typeof timestamp === 'number' || typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  // If timestamp is an unexpected object (not a Firestore Timestamp or Date), return current date
  return new Date();
};

// Helper function to handle server timestamp in mutations
export const prepareTimestampForFirestore = (data: unknown): unknown => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  // Deep clone to avoid modifying original object
  const result: Record<string, unknown> = { ...(data as Record<string, unknown>) };
  
  // Convert Date objects to Firestore Timestamp
  Object.keys(result).forEach(key => {
    if (result[key] instanceof Date) {
      result[key] = Timestamp.fromDate(result[key] as Date);
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = prepareTimestampForFirestore(result[key]);
    }
  });
  
  return result;
};
