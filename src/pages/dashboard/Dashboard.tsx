
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Wallpaper } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ImageIcon, Clock, Check, X } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [recentWallpapers, setRecentWallpapers] = useState<Wallpaper[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch recent wallpapers
        const wallpapersQuery = query(
          collection(db, "wallpapers"),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const wallpapersSnapshot = await getDocs(wallpapersQuery);
        const wallpapersData = wallpapersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Wallpaper[];
        setRecentWallpapers(wallpapersData);

        // Fetch counts
        const pendingQuery = query(
          collection(db, "wallpapers"),
          where("status", "==", "pending")
        );
        const pendingSnapshot = await getDocs(pendingQuery);
        setPendingCount(pendingSnapshot.size);

        const approvedQuery = query(
          collection(db, "wallpapers"),
          where("status", "==", "approved")
        );
        const approvedSnapshot = await getDocs(approvedQuery);
        setApprovedCount(approvedSnapshot.size);

        const rejectedQuery = query(
          collection(db, "wallpapers"),
          where("status", "==", "rejected")
        );
        const rejectedSnapshot = await getDocs(rejectedQuery);
        setRejectedCount(rejectedSnapshot.size);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the wallpaper admin panel</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Wallpapers</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {approvedCount + pendingCount + rejectedCount}
            </div>
            <p className="text-xs text-muted-foreground">
              All wallpapers in the database
            </p>
          </CardContent>
        </Card>

        <Link to="/dashboard/pending">
          <Card className="hover:bg-muted/10 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting moderation
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Check className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">
              Live in the app
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <X className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">
              Not approved for use
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Wallpapers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentWallpapers.length > 0 ? (
              <div className="rounded-md border">
                <div className="dashboard-table w-full">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th>Thumbnail</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Author</th>
                        <th>Date Added</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentWallpapers.map((wallpaper) => (
                        <tr key={wallpaper.id}>
                          <td className="w-16">
                            <Link to={`/dashboard/wallpapers/${wallpaper.id}`}>
                              <img
                                src={wallpaper.thumbnail}
                                alt={wallpaper.name}
                                className="h-12 w-12 rounded-md object-cover"
                              />
                            </Link>
                          </td>
                          <td>
                            <Link to={`/dashboard/wallpapers/${wallpaper.id}`} className="hover:underline">
                              {wallpaper.name}
                            </Link>
                          </td>
                          <td>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                wallpaper.status === "approved"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : wallpaper.status === "pending"
                                  ? "bg-amber-50 text-amber-700"
                                  : wallpaper.status === "hidden"
                                  ? "bg-slate-50 text-slate-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {wallpaper.status}
                            </span>
                          </td>
                          <td>{wallpaper.author}</td>
                          <td>
                            {wallpaper.createdAt instanceof Date
                              ? wallpaper.createdAt.toISOString()
                              : wallpaper.createdAt?.toDate
                                ? wallpaper.createdAt.toDate().toISOString()
                                : wallpaper.createdAt.toString().slice(0, 16).replace("T", " ")}
                          </td>
                          <td>
                            <Link
                              to={`/dashboard/wallpapers/${wallpaper.id}`}
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                No recent wallpapers found
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
