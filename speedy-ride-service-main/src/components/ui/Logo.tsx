import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 font-bold", className)}>
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg",
          dark ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground",
        )}
      >
        <Zap className="h-4 w-4" fill="currentColor" />
      </span>
      <span className={cn("text-lg tracking-tight", dark ? "text-primary-foreground" : "text-foreground")}>
        SwiftRide
      </span>
    </div>
  );
}
