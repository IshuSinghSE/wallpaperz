
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Wallpaper } from "@/types";
import { cn } from "@/lib/utils";
import { Monitor, Smartphone, LayoutPanelTop } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WallpaperPreviewProps {
  wallpaper: Partial<Wallpaper>;
  className?: string;
}

const WallpaperPreview = ({ wallpaper, className }: WallpaperPreviewProps) => {
  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
          <LayoutPanelTop className="h-4 w-4" />
          Preview
        </h3>
      </div>
      
      <Tabs defaultValue="desktop" className="w-full">
        <div className="px-4 pt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="desktop">
              <Monitor className="h-4 w-4 mr-2" />
              Desktop
            </TabsTrigger>
            <TabsTrigger value="mobile">
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="desktop" className="p-4 space-y-4 mt-2">
          <div className="border rounded-lg overflow-hidden bg-background/50">
            <AspectRatio ratio={16 / 9} className="bg-muted">
              {wallpaper.thumbnailUrl ? (
                <img
                  src={wallpaper.thumbnailUrl}
                  alt={wallpaper.name || "Wallpaper preview"}
                  className="h-full w-full object-cover"
                />
              ) : wallpaper.imageUrl ? (
                <img
                  src={wallpaper.imageUrl}
                  alt={wallpaper.name || "Wallpaper"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <p className="text-sm text-muted-foreground">No preview available</p>
                </div>
              )}
            </AspectRatio>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <span className="font-medium text-foreground">Resolution:</span>
              {wallpaper.resolution || "Unknown"}
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="mobile" className="p-4 space-y-4 mt-2">
          <div className="border rounded-lg overflow-hidden max-w-[250px] mx-auto bg-background/50">
            <AspectRatio ratio={9 / 16} className="bg-muted">
              {wallpaper.thumbnailUrl ? (
                <img
                  src={wallpaper.thumbnailUrl}
                  alt={wallpaper.name || "Mobile preview"}
                  className="h-full w-full object-cover"
                />
              ) : wallpaper.imageUrl ? (
                <img
                  src={wallpaper.imageUrl}
                  alt={wallpaper.name || "Wallpaper"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <p className="text-sm text-muted-foreground">No preview available</p>
                </div>
              )}
            </AspectRatio>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <span className="font-medium text-foreground">Orientation:</span>
              {wallpaper.orientation || "Portrait"}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WallpaperPreview;
