
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Wallpaper } from "@/types";
import { CACHE_KEYS } from "@/lib/cache-keys";
import { DocumentData } from "firebase/firestore";

export const useDashboardData = () => {
  // Fetch dashboard summary data with caching
  const { 
    data, 
    isLoading,
    isFetching,
    refetch 
  } = useQuery({
    queryKey: CACHE_KEYS.DASHBOARD.overview(),
    queryFn: async () => {
      try {
        // Fetch recent wallpapers
        const wallpapersQuery = query(
          collection(db, "wallpapers"),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const wallpapersSnapshot = await getDocs(wallpapersQuery);
        const recentWallpapers = wallpapersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as DocumentData
        })) as Wallpaper[];

        // Fetch counts
        const pendingQuery = query(
          collection(db, "wallpapers"),
          where("status", "==", "pending")
        );
        const pendingSnapshot = await getDocs(pendingQuery);
        const pendingCount = pendingSnapshot.size;

        const approvedQuery = query(
          collection(db, "wallpapers"),
          where("status", "==", "approved")
        );
        const approvedSnapshot = await getDocs(approvedQuery);
        const approvedCount = approvedSnapshot.size;

        const rejectedQuery = query(
          collection(db, "wallpapers"),
          where("status", "==", "rejected")
        );
        const rejectedSnapshot = await getDocs(rejectedQuery);
        const rejectedCount = rejectedSnapshot.size;

        return {
          recentWallpapers,
          pendingCount,
          approvedCount,
          rejectedCount,
          totalCount: pendingCount + approvedCount + rejectedCount
        };
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    dashboardData: data,
    isLoading,
    isFetching,
    refresh: refetch
  };
};
