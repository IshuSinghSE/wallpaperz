
import React from "react";
import { Collection } from "@/types";
import { Edit, Trash2, Image } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CollectionCardProps {
  collection: Collection;
  onEdit: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
}

const CollectionCard = ({ collection, onEdit, onDelete }: CollectionCardProps) => {
  return (
    <Card className="overflow-hidden backdrop-blur-sm bg-white/5 border border-white/10 shadow-xl transition-all hover:shadow-2xl hover:shadow-primary/5 group">
      <div className="relative h-40 bg-slate-100 dark:bg-slate-800 group-hover:opacity-90 transition-opacity">
        {collection.coverImage ? (
          <img
            src={collection.coverImage}
            alt={collection.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Image className="h-12 w-12 text-slate-400" />
          </div>
        )}
        {collection.type === "auto" && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-primary/70">Auto</Badge>
          </div>
        )}
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-lg">{collection.name}</CardTitle>
        {collection.description && (
          <CardDescription className="line-clamp-2">
            {collection.description}
          </CardDescription>
        )}
        {collection.tags && collection.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {collection.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="inline-block rounded-full bg-primary/10 backdrop-blur-sm px-2 py-0.5 text-xs"
              >
                {tag}
              </span>
            ))}
            {collection.tags.length > 3 && (
              <span className="inline-block rounded-full bg-primary/10 backdrop-blur-sm px-2 py-0.5 text-xs">
                +{collection.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </CardHeader>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <div>
          <span className="text-sm text-muted-foreground">
            {collection.wallpaperIds?.length || 0} wallpapers
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(collection)}
            className="hover:bg-primary/10"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(collection)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CollectionCard;
