
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ImageIcon, Clock, Check, X, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { 
    dashboardData, 
    isLoading, 
    isFetching, 
    refresh 
  } = useDashboardData();

  if (isLoading && !dashboardData) {
    return (
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the wallpaper admin panel</p>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to the wallpaper admin panel</p>
        </div>
        <Button 
          onClick={() => refresh()} 
          size="sm" 
          variant="outline" 
          disabled={isFetching}
          className="backdrop-blur-sm bg-white/10 border-white/20 shadow-lg"
        >
          {isFetching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="backdrop-blur-sm bg-white/10 dark:bg-slate-900/20 border border-white/20 dark:border-slate-800/50 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Wallpapers</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.totalCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              All wallpapers in the database
            </p>
          </CardContent>
        </Card>

        <Link to="/dashboard/pending">
          <Card className="hover:bg-muted/10 transition-colors cursor-pointer h-full backdrop-blur-sm bg-white/10 dark:bg-slate-900/20 border border-white/20 dark:border-slate-800/50 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.pendingCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting moderation
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="backdrop-blur-sm bg-white/10 dark:bg-slate-900/20 border border-white/20 dark:border-slate-800/50 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Check className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.approvedCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Live in the app
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/10 dark:bg-slate-900/20 border border-white/20 dark:border-slate-800/50 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <X className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.rejectedCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Not approved for use
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="backdrop-blur-sm bg-white/10 dark:bg-slate-900/20 border border-white/20 dark:border-slate-800/50 shadow-xl">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Recent Wallpapers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData?.recentWallpapers && dashboardData.recentWallpapers.length > 0 ? (
              <div className="rounded-md border border-white/20 dark:border-slate-800/50 overflow-hidden">
                <div className="dashboard-table w-full">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20 dark:border-slate-800/50">
                        <th>Thumbnail</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th className="hidden sm:table-cell">Author</th>
                        <th className="hidden md:table-cell">Date Added</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentWallpapers.map((wallpaper) => (
                        <tr key={wallpaper.id} className="border-b border-white/10 dark:border-slate-800/30">
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
                          <td className="hidden sm:table-cell">{wallpaper.author}</td>
                          <td className="hidden md:table-cell">
                            {wallpaper.createdAt instanceof Date
                              ? wallpaper.createdAt.toLocaleDateString()
                              : wallpaper.createdAt?.toDate
                                ? wallpaper.createdAt.toDate().toLocaleDateString()
                                : new Date(wallpaper.createdAt).toLocaleDateString()}
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

// Loading skeleton for dashboard
const DashboardSkeleton = () => {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="backdrop-blur-sm bg-white/10 dark:bg-slate-900/20 border border-white/20 dark:border-slate-800/50 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="backdrop-blur-sm bg-white/10 dark:bg-slate-900/20 border border-white/20 dark:border-slate-800/50 shadow-xl">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4 border-b pb-4">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default Dashboard;
