import { cn } from "@/lib/utils";
import type { RideStatus } from "@/types";

const styles: Record<string, string> = {
  COMPLETED: "bg-success/10 text-success border-success/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
  IN_PROGRESS: "bg-accent/10 text-accent border-accent/20",
  REQUESTED: "bg-warning/10 text-warning border-warning/20",
  DRIVER_ASSIGNED: "bg-accent/10 text-accent border-accent/20",
  DRIVER_ARRIVED: "bg-accent/10 text-accent border-accent/20",
  AVAILABLE: "bg-success/10 text-success border-success/20",
  OFFLINE: "bg-muted text-muted-foreground border-border",
};

const labels: Record<string, string> = {
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  IN_PROGRESS: "In Progress",
  REQUESTED: "Requested",
  DRIVER_ASSIGNED: "Driver Assigned",
  DRIVER_ARRIVED: "Driver Arrived",
  AVAILABLE: "Available",
  OFFLINE: "Offline",
};

export function StatusBadge({
  status,
  className,
}: {
  status: RideStatus | "AVAILABLE" | "OFFLINE";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        styles[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labels[status] ?? status}
    </span>
  );
}
