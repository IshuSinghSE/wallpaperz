import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Wallpaper, WallpaperStatus } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Loader2 } from "@/lib/icons";
import { Link } from "react-router-dom";

const PendingApproval = () => {
  const [pendingWallpapers, setPendingWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const allSelected =
    pendingWallpapers.length > 0 &&
    selectedIds.size === pendingWallpapers.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingWallpapers.map((w) => w.id)));
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleBulkStatusChange = async (status: WallpaperStatus) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setProcessingIds((prev) => new Set([...prev, ...ids]));
    try {
      await Promise.all(
        ids.map((id) => updateDoc(doc(db, "wallpapers", id), { status }))
      );
      setPendingWallpapers((prev) =>
        prev.filter((w) => !selectedIds.has(w.id))
      );
      setSelectedIds(new Set());
      toast({
        title: `Wallpapers ${status}`,
        description: `Selected wallpapers have been ${status}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${status} selected wallpapers`,
        variant: "destructive",
      });
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        ids.forEach((id) => newSet.delete(id));
        return newSet;
      });
    }
  };
  const { toast } = useToast();

  useEffect(() => {
    const fetchPendingWallpapers = async () => {
      try {
        setLoading(true);
        const wallpapersRef = collection(db, "wallpapers");
        const q = query(wallpapersRef, where("status", "==", "pending"));
        const querySnapshot = await getDocs(q);

        const wallpapers = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Wallpaper[];

        setPendingWallpapers(wallpapers);
      } catch (error) {
        console.error("Error fetching pending wallpapers:", error);
        toast({
          title: "Error",
          description: "Failed to load pending wallpapers",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPendingWallpapers();
  }, [toast]);

  const handleStatusChange = async (id: string, status: WallpaperStatus) => {
    try {
      setProcessingIds((prev) => new Set(prev).add(id));

      await updateDoc(doc(db, "wallpapers", id), {
        status: status,
      });

      // Update the local state
      setPendingWallpapers((prevWallpapers) =>
        prevWallpapers.filter((wallpaper) => wallpaper.id !== id)
      );

      toast({
        title: `Wallpaper ${status}`,
        description: `The wallpaper has been ${status}`,
      });
    } catch (error) {
      console.error(`Error ${status} wallpaper:`, error);
      toast({
        title: "Error",
        description: `Failed to ${status} wallpaper`,
        variant: "destructive",
      });
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const isProcessing = (id: string) => processingIds.has(id);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading pending wallpapers...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Approval</h1>
          <p className="text-gray-700 dark:text-gray-300">
            Review and moderate new wallpaper submissions
          </p>
        </div>
        {pendingWallpapers.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            <Button
              variant={allSelected ? "secondary" : "outline"}
              onClick={handleSelectAll}
            >
              {allSelected ? "Deselect All" : "Select All"}
            </Button>
            <Button
              variant="outline"
              className="flex-1 hover:dark:bg-green-950 hover:bg-green-50"
              onClick={() => handleBulkStatusChange("approved")}
              disabled={
                selectedIds.size === 0 ||
                Array.from(selectedIds).some((id) => processingIds.has(id))
              }
            >
              Approve Selected
            </Button>
            <Button
              variant="outline"
              onClick={() => handleBulkStatusChange("rejected")}
              className="flex-1 hover:bg-red-50 hover:dark:bg-red-950"
              disabled={
                selectedIds.size === 0 ||
                Array.from(selectedIds).some((id) => processingIds.has(id))
              }
            >
              Reject Selected
            </Button>
          </div>
        )}
      </div>

      {pendingWallpapers.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
          <p className="text-gray-700 dark:text-gray-300">
            No wallpapers pending approval
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            All wallpapers have been reviewed
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pendingWallpapers.map((wallpaper) => (
            <Card
              key={wallpaper.id}
              className={`overflow-hidden shadow-md border border-slate-100 dark:border-slate-800 ${
                selectedIds.has(wallpaper.id) ? "ring-2 ring-primary/40" : ""
              }`}
            >
              <div className="aspect-[3/4] relative">
                <img
                  src={wallpaper.thumbnail}
                  alt={wallpaper.name}
                  className="h-full w-full object-cover"
                />
                {/* Beautiful checkbox in top-left */}
                <div className="absolute top-2 left-2 z-10">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(wallpaper.id)}
                      onChange={() => handleSelect(wallpaper.id)}
                      className="peer sr-only"
                      aria-label="Select wallpaper"
                    />
                    <span
                      className={`h-6 w-6 rounded flex items-center justify-center transition-all duration-150 shadow-sm backdrop-blur-sm
                        bg-white/30 dark:bg-neutral-900/30
                        peer-checked:bg-primary/70 peer-checked:border-primary peer-checked:bg-opacity-80`}
                    >
                      {selectedIds.has(wallpaper.id) && (
                        <svg
                          className="h-4 w-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </span>
                  </label>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="line-clamp-1 text-lg font-semibold text-gray-900 dark:text-white drop-shadow-md">
                    {wallpaper.name}
                  </h3>
                  <p className="line-clamp-1 text-sm text-gray-800 dark:text-white/80 drop-shadow-md">
                    By {wallpaper.author}
                  </p>
                </div>
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg text-gray-900 dark:text-white">{wallpaper.name}</CardTitle>
              </CardHeader>

              <CardContent className="p-4 pt-0">
                <div className="flex flex-wrap gap-1">
                  {wallpaper.tags.slice(0, 2).map((tag, i) => (
                    <span
                      key={i}
                      className="inline-block rounded-full bg-gray-100 dark:bg-muted px-2 py-1 text-xs text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                  {wallpaper.tags.length > 2 && (
                    <span className="inline-block rounded-full bg-gray-100 dark:bg-muted px-2 py-1 text-xs text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                      +{wallpaper.tags.length - 2} more
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <Link 
                    to={`/dashboard/wallpapers/${wallpaper.id}`}
                    className="text-sm font-medium text-blue-600 dark:text-primary hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between gap-2 p-4 pt-0">
                <Button
                  variant="outline"
                  className="flex-1 hover:dark:bg-green-950 hover:bg-green-50"
                  onClick={() => handleStatusChange(wallpaper.id, "approved")}
                  disabled={isProcessing(wallpaper.id)}
                >
                  {isProcessing(wallpaper.id) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4 text-emerald-500" />
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="flex-1 hover:bg-red-50 hover:dark:bg-red-950"
                  onClick={() => handleStatusChange(wallpaper.id, "rejected")}
                  disabled={isProcessing(wallpaper.id)}
                >
                  {isProcessing(wallpaper.id) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <X className="mr-2 h-4 w-4 text-rose-500" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingApproval;
