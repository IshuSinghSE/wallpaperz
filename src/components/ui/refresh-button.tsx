
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RefreshButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  refreshText?: string;
}

export function RefreshButton({
  isLoading = false,
  loadingText = "Refreshing...",
  refreshText = "Refresh",
  className,
  children,
  ...props
}: RefreshButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isLoading}
      className={cn("backdrop-blur-sm bg-white/10 border-white/20 shadow-lg", className)}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          {refreshText || children}
        </>
      )}
    </Button>
  );
}
