import { MapPin, Navigation } from "lucide-react";

interface Props {
  pickup?: string;
  dropoff?: string;
}

// Static styled "map" — pure SVG, no external API needed
export function MapPlaceholder({ pickup, dropoff }: Props) {
  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <svg
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="hsl(214 32% 91%)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="400" fill="hsl(210 40% 98%)" />
        <rect width="400" height="400" fill="url(#grid)" />
        {/* roads */}
        <path d="M 0 120 Q 150 100 400 180" stroke="hsl(0 0% 88%)" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d="M 60 0 L 100 400" stroke="hsl(0 0% 88%)" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M 0 280 Q 200 240 400 320" stroke="hsl(0 0% 88%)" strokeWidth="12" fill="none" strokeLinecap="round" />
        <path d="M 280 0 L 320 400" stroke="hsl(0 0% 88%)" strokeWidth="10" fill="none" strokeLinecap="round" />
        {/* route line */}
        <path
          d="M 80 110 Q 180 180 300 320"
          stroke="hsl(239 84% 67%)"
          strokeWidth="4"
          fill="none"
          strokeDasharray="8 6"
          strokeLinecap="round"
        />
      </svg>

      {/* Pickup pin */}
      <div className="absolute left-[18%] top-[26%] flex flex-col items-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success text-success-foreground shadow-lg ring-4 ring-success/20">
          <MapPin className="h-4 w-4" />
        </div>
      </div>

      {/* Dropoff pin */}
      <div className="absolute right-[22%] bottom-[18%] flex flex-col items-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg ring-4 ring-accent/20">
          <Navigation className="h-4 w-4" />
        </div>
      </div>

      {/* Caption overlay */}
      {(pickup || dropoff) && (
        <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-border bg-card/95 p-3 backdrop-blur shadow-sm">
          <div className="flex items-start gap-2 text-xs">
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-success" />
            <span className="font-medium text-foreground truncate">{pickup || "Pickup location"}</span>
          </div>
          <div className="my-1.5 ml-1 h-3 w-px bg-border" />
          <div className="flex items-start gap-2 text-xs">
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
            <span className="font-medium text-foreground truncate">{dropoff || "Drop-off location"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
