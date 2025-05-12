
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Wallpaper } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const PendingApproval = () => {
  const [pendingWallpapers, setPendingWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    const fetchPendingWallpapers = async () => {
      try {
        setLoading(true);
        const wallpapersRef = collection(db, "wallpapers");
        const q = query(wallpapersRef, where("status", "==", "pending"));
        const querySnapshot = await getDocs(q);
        
        const wallpapers = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
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

  const handleStatusChange = async (id: string, status: "approved" | "rejected") => {
    try {
      setProcessingIds(prev => new Set(prev).add(id));
      
      await updateDoc(doc(db, "wallpapers", id), {
        status: status
      });
      
      // Update the local state
      setPendingWallpapers(prevWallpapers => 
        prevWallpapers.filter(wallpaper => wallpaper.id !== id)
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
      setProcessingIds(prev => {
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
      <div>
        <h1 className="text-2xl font-bold">Pending Approval</h1>
        <p className="text-muted-foreground">
          Review and moderate new wallpaper submissions
        </p>
      </div>

      {pendingWallpapers.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">No wallpapers pending approval</p>
          <p className="text-sm text-muted-foreground">
            All wallpapers have been reviewed
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pendingWallpapers.map((wallpaper) => (
            <Card key={wallpaper.id} className="overflow-hidden shadow-md border border-slate-100 dark:border-slate-800">
              <div className="aspect-[3/4] relative">
                <img
                  src={wallpaper.thumbnail}
                  alt={wallpaper.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="line-clamp-1 text-lg font-semibold text-white">
                    {wallpaper.name}
                  </h3>
                  <p className="line-clamp-1 text-sm text-white/80">
                    By {wallpaper.author}
                  </p>
                </div>
              </div>
              
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">{wallpaper.name}</CardTitle>
              </CardHeader>
              
              <CardContent className="p-4 pt-0">
                <div className="flex flex-wrap gap-1">
                  {wallpaper.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="inline-block rounded-full bg-muted px-2 py-1 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {wallpaper.tags.length > 3 && (
                    <span className="inline-block rounded-full bg-muted px-2 py-1 text-xs">
                      +{wallpaper.tags.length - 3} more
                    </span>
                  )}
                </div>
                
                <div className="mt-2">
                  <Link 
                    to={`/dashboard/wallpapers/${wallpaper.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between gap-2 p-4 pt-0">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => handleStatusChange(wallpaper.id, "approved")}
                  disabled={isProcessing(wallpaper.id)}
                >
                  {isProcessing(wallpaper.id) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4 text-emerald-500" /> Approve
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => handleStatusChange(wallpaper.id, "rejected")}
                  disabled={isProcessing(wallpaper.id)}
                >
                  {isProcessing(wallpaper.id) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <X className="mr-2 h-4 w-4 text-rose-500" /> Reject
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
