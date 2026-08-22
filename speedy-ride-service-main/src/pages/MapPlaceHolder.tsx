import { MapPin, Navigation, Car, Radio } from "lucide-react";

/**
 * MapPlaceholder
 * ----------------------------------------------------------------------------
 * A dependency-free, API-key-free stand-in for a real map.
 * If your project already has a map component, delete this file and swap it in
 * inside DriverActiveRide.tsx / UserRideTracking.tsx (single JSX tag each).
 *
 * To upgrade later, replace the inner <div> with your Google Maps / Mapbox
 * canvas and keep the same props.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface MapPlaceholderProps {
  pickup?: Coordinates | null;
  drop?: Coordinates | null;
  driver?: Coordinates | null;
  pickupLabel?: string;
  dropLabel?: string;
  /** Shows the pulsing "Live location" chip */
  live?: boolean;
  className?: string;
}

function formatCoord(c?: Coordinates | null): string {
  if (!c) return "Location unavailable";
  return `${c.latitude.toFixed(5)}, ${c.longitude.toFixed(5)}`;
}

export function MapPlaceholder({
  pickup,
  drop,
  driver,
  pickupLabel = "Pickup",
  dropLabel = "Destination",
  live = false,
  className = "",
}: MapPlaceholderProps) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 ${className}`}
      role="img"
      aria-label="Map preview showing pickup, destination and driver position"
    >
      {/* Grid backdrop */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Faux route */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M 14% 78% C 34% 66%, 40% 40%, 62% 34% S 82% 24%, 88% 18%"
          fill="none"
          stroke="#111827"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray="10 10"
          opacity={0.55}
        />
      </svg>

      {/* Markers */}
      <div className="absolute left-[10%] top-[72%] flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
          <MapPin className="h-4 w-4" />
        </span>
        <span className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-neutral-800 shadow-sm">
          {pickupLabel}
        </span>
      </div>

      <div className="absolute right-[6%] top-[12%] flex items-center gap-2">
        <span className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-neutral-800 shadow-sm">
          {dropLabel}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white shadow-md">
          <Navigation className="h-4 w-4" />
        </span>
      </div>

      {driver ? (
        <div className="absolute left-[46%] top-[42%] flex items-center gap-2">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg">
            <Car className="h-4 w-4" />
            <span className="absolute inline-flex h-9 w-9 animate-ping rounded-full bg-blue-500/40" />
          </span>
        </div>
      ) : null}

      {live ? (
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-neutral-800 shadow-sm">
          <Radio className="h-3.5 w-3.5 text-emerald-600" />
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-600" />
          </span>
          Live location
        </div>
      ) : null}

      {/* Coordinate readout — helpful while the real map is not wired up */}
      <div className="absolute inset-x-3 bottom-3 grid gap-1 rounded-xl bg-white/95 p-3 text-[11px] leading-tight text-neutral-600 shadow-sm sm:grid-cols-3">
        <div>
          <span className="block font-semibold text-neutral-900">Pickup</span>
          {formatCoord(pickup)}
        </div>
        <div>
          <span className="block font-semibold text-neutral-900">Destination</span>
          {formatCoord(drop)}
        </div>
        <div>
          <span className="block font-semibold text-neutral-900">Driver</span>
          {formatCoord(driver)}
        </div>
      </div>

      {/* Keeps the box a sensible height at every breakpoint */}
      <div className="h-[320px] w-full sm:h-[420px] lg:h-[560px]" />
    </div>
  );
}

export default MapPlaceholder;
