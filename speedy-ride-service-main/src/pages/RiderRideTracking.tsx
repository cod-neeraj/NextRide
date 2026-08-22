import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Car,
  Check,
  CircleDollarSign,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  Route as RouteIcon,
  Star,
  User,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import AppCard from "@/components/AppCard";
import AppButton from "@/components/AppButton";
import StatusBadge from "@/components/StatusBadge";
import { userApi } from "@/services/instances";
import { useWebSocket } from "@/hooks/useWebSocket";
import MapPlaceholder from "@/components/ride/MapPlaceholder";

/* ============================================================================
 * >>> CHANGE ME #1 — real-time destination
 * ==========================================================================*/
const RIDE_STATUS_DESTINATION = "/user/queue/ride-status";

/** Flip to true only once you actually have messaging endpoints. */
const MESSAGING_ENABLED = false;

/* ============================================================================
 * Types — swap in your own: import type { Ride } from "@/types";
 * ==========================================================================*/
export type RideStatus =
  | "REQUESTED"
  | "DRIVER_ASSIGNED"
  | "DRIVER_ARRIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface RideDriver {
  id?: string | number;
  name?: string;
  fullName?: string;
  phone?: string;
  phoneNumber?: string;
  rating?: number;
  avatarUrl?: string;
  vehicleName?: string;
  vehicleNumber?: string;
}

export interface RideLike {
  id?: string | number;
  rideId?: string | number;
  status: RideStatus;
  pickupAddress?: string;
  dropAddress?: string;
  distance?: number;
  fare?: number;
  profit?: number;
  pickupLatitude?: number;
  pickupLongitude?: number;
  dropLatitude?: number;
  dropLongitude?: number;
  driverLatitude?: number;
  driverLongitude?: number;
  driver?: RideDriver | null;
}

interface RideStatusEvent {
  rideId: string | number;
  status: RideStatus;
  driverLatitude?: number;
  driverLongitude?: number;
}

const STATUS_COPY: Record<string, { headline: string; hint: string }> = {
  DRIVER_ASSIGNED: {
    headline: "Driver is on the way",
    hint: "Your driver is heading to the pickup point.",
  },
  DRIVER_ARRIVED: {
    headline: "Driver has arrived",
    hint: "Your driver is waiting at the pickup point.",
  },
  IN_PROGRESS: {
    headline: "You're on your way",
    hint: "Enjoy the ride — you'll be at your destination soon.",
  },
  COMPLETED: {
    headline: "Ride completed",
    hint: "Thanks for riding with us.",
  },
};

const STEPS: { key: RideStatus; label: string }[] = [
  { key: "DRIVER_ASSIGNED", label: "Driver Assigned" },
  { key: "DRIVER_ARRIVED", label: "Driver Arrived" },
  { key: "IN_PROGRESS", label: "Ride Started" },
  { key: "COMPLETED", label: "Completed" },
];

/* ========================================================================== */

function coordOrNull(lat?: number, lng?: number) {
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  return { latitude: lat, longitude: lng };
}

function money(value?: number) {
  if (typeof value !== "number") return "—";
  return `₹${value.toFixed(2)}`;
}

function km(value?: number) {
  if (typeof value !== "number") return "—";
  return `${value.toFixed(1)} km`;
}

type WsLike = {
  connected?: boolean;
  isConnected?: boolean;
  subscribe?: (
    destination: string,
    cb: (payload: unknown) => void,
  ) => (() => void) | { unsubscribe: () => void };
  client?: {
    connected?: boolean;
    subscribe: (
      destination: string,
      cb: (message: { body: string }) => void,
    ) => { unsubscribe: () => void };
  };
};

function subscribeToDestination(
  ws: WsLike,
  destination: string,
  onPayload: (payload: unknown) => void,
): (() => void) | undefined {
  if (typeof ws.subscribe === "function") {
    const result = ws.subscribe(destination, onPayload);
    if (typeof result === "function") return result;
    if (result && typeof result.unsubscribe === "function") return () => result.unsubscribe();
    return undefined;
  }

  const client = ws.client;
  if (client && typeof client.subscribe === "function") {
    const sub = client.subscribe(destination, (message) => {
      try {
        onPayload(JSON.parse(message.body));
      } catch {
        // Ignore non-JSON frames.
      }
    });
    return () => sub.unsubscribe();
  }

  return undefined;
}

export default function UserRideTracking() {
  const { rideId = "" } = useParams<{ rideId: string }>();
  const navigate = useNavigate();
  const ws = useWebSocket() as unknown as WsLike;

  const [ride, setRide] = useState<RideLike | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [driverPosition, setDriverPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const rideIdRef = useRef(rideId);
  rideIdRef.current = rideId;

  /* ==========================================================================
   * >>> CHANGE ME #2 — fetch a single ride (used on load / refresh)
   * ========================================================================*/
  const fetchRide = useCallback(async (id: string): Promise<RideLike> => {
    const response = await userApi.get(`/api/rides/${id}`);
    const payload = (response as { data?: unknown })?.data ?? response;
    return payload as RideLike;
  }, []);

  /* ==========================================================================
   * >>> CHANGE ME #3 — rating submission (frontend-only until you have an API)
   * Replace the body with your real call, e.g.
   *   await userApi.post(`/api/rides/${rideId}/rating`, { rating: value });
   * ========================================================================*/
  const submitRating = useCallback(async (value: number): Promise<void> => {
    void value;
    // No rating endpoint exists yet — nothing is sent to the backend.
  }, []);

  const loadRide = useCallback(async () => {
    if (!rideId) {
      setLoadError("Missing ride id.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchRide(rideId);
      setRide(data);
      const pos = coordOrNull(data.driverLatitude, data.driverLongitude);
      if (pos) setDriverPosition(pos);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load this ride.");
    } finally {
      setLoading(false);
    }
  }, [fetchRide, rideId]);

  useEffect(() => {
    void loadRide();
  }, [loadRide]);

  // Live updates — WebSocket is the only source, no polling.
  useEffect(() => {
    const connected = ws?.connected ?? ws?.isConnected ?? ws?.client?.connected ?? false;
    if (!connected) return;

    const unsubscribe = subscribeToDestination(ws, RIDE_STATUS_DESTINATION, (payload) => {
      const event = payload as RideStatusEvent | null;
      if (!event || String(event.rideId) !== String(rideIdRef.current)) return;

      const pos = coordOrNull(event.driverLatitude, event.driverLongitude);
      if (pos) setDriverPosition(pos);

      setRide((prev) => (prev ? { ...prev, status: event.status ?? prev.status } : prev));
    });

    return () => {
      unsubscribe?.();
    };
  }, [ws]);

  const status = ride?.status;
  const copy = status ? STATUS_COPY[status] : undefined;
  const driver = ride?.driver ?? null;
  const driverPhone = driver?.phone ?? driver?.phoneNumber;
  const driverName = driver?.name ?? driver?.fullName ?? "Your driver";

  const currentStepIndex = useMemo(() => STEPS.findIndex((step) => step.key === status), [status]);

  const handleRate = useCallback(
    async (value: number) => {
      setRating(value);
      try {
        await submitRating(value);
        setRatingSubmitted(true);
        toast.success("Thanks for your feedback!");
      } catch {
        toast.error("Could not submit your rating.");
      }
    },
    [submitRating],
  );

  const pickupCoords = coordOrNull(ride?.pickupLatitude, ride?.pickupLongitude);
  const dropCoords = coordOrNull(ride?.dropLatitude, ride?.dropLongitude);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-5 sm:px-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">Your Ride</h1>
            <p className="text-sm text-neutral-500">
              {copy?.headline ?? "Tracking your ride"} · #{String(ride?.rideId ?? ride?.id ?? rideId)}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {loading ? (
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="h-[320px] animate-pulse rounded-2xl bg-neutral-200 sm:h-[420px] lg:h-[560px]" />
            <div className="space-y-4">
              <div className="h-44 animate-pulse rounded-2xl bg-neutral-200" />
              <div className="h-56 animate-pulse rounded-2xl bg-neutral-200" />
            </div>
          </div>
        ) : loadError || !ride ? (
          <AppCard className="mx-auto max-w-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-neutral-900">We couldn't load this ride</h2>
            <p className="mt-2 text-sm text-neutral-500">{loadError ?? "Ride not found."}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <AppButton onClick={() => void loadRide()}>Try again</AppButton>
              <AppButton variant="secondary" onClick={() => navigate("/dashboard")}>
                Back
              </AppButton>
            </div>
          </AppCard>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <section className="space-y-4">
              <MapPlaceholder
                pickup={pickupCoords}
                drop={dropCoords}
                driver={driverPosition}
                live={status !== "COMPLETED"}
              />

              {status === "COMPLETED" ? (
                <AppCard className="p-6 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-6 w-6" />
                  </span>
                  <h2 className="mt-3 text-lg font-semibold text-neutral-900">Ride completed</h2>
                  <p className="mt-1 text-sm text-neutral-500">How was your ride?</p>

                  <div className="mt-4 flex justify-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((value) => {
                      const active = (hoverRating || rating) >= value;
                      return (
                        <button
                          key={value}
                          type="button"
                          aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                          onMouseEnter={() => setHoverRating(value)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => void handleRate(value)}
                          className="rounded-full p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 ${active ? "fill-amber-400 text-amber-400" : "text-neutral-300"}`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {ratingSubmitted ? (
                    <p className="mt-3 text-sm font-medium text-emerald-700">
                      Thanks! You rated this ride {rating}/5.
                    </p>
                  ) : (
                    <p className="mt-3 text-xs text-neutral-400">Tap a star to rate your driver.</p>
                  )}
                </AppCard>
              ) : null}
            </section>

            <aside className="space-y-4">
              {/* Status + stepper */}
              <AppCard className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Status</p>
                    <h2 className="mt-1 text-lg font-semibold text-neutral-900">
                      {copy?.headline ?? "Waiting for updates"}
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">{copy?.hint ?? ""}</p>
                  </div>
                  <StatusBadge status={status} />
                </div>

                <ol className="mt-5 space-y-0">
                  {STEPS.map((step, index) => {
                    const done = currentStepIndex > index;
                    const active = currentStepIndex === index;
                    const isLast = index === STEPS.length - 1;
                    return (
                      <li key={step.key} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                              done
                                ? "border-emerald-600 bg-emerald-600 text-white"
                                : active
                                  ? "border-neutral-900 bg-neutral-900 text-white"
                                  : "border-neutral-300 bg-white text-neutral-400"
                            }`}
                          >
                            {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                          </span>
                          {!isLast ? (
                            <span
                              className={`w-0.5 flex-1 ${done ? "bg-emerald-500" : "bg-neutral-200"}`}
                              style={{ minHeight: 22 }}
                            />
                          ) : null}
                        </div>
                        <div className={isLast ? "pb-0 pt-1" : "pb-4 pt-1"}>
                          <p
                            className={`text-sm ${
                              active ? "font-semibold text-neutral-900" : done ? "text-neutral-700" : "text-neutral-400"
                            }`}
                          >
                            {step.label}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </AppCard>

              {/* Driver card */}
              {driver ? (
                <AppCard className="p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Your driver</h3>

                  <div className="mt-4 flex items-center gap-3">
                    {driver.avatarUrl ? (
                      <img src={driver.avatarUrl} alt={driverName} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 text-neutral-600">
                        <User className="h-5 w-5" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-900">{driverName}</p>
                      {typeof driver.rating === "number" ? (
                        <p className="flex items-center gap-1 text-xs text-neutral-500">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {driver.rating.toFixed(1)}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-neutral-50 p-3">
                    <Car className="h-4 w-4 shrink-0 text-neutral-500" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-900">{driver.vehicleName ?? "Vehicle"}</p>
                      <p className="font-mono text-xs uppercase tracking-wide text-neutral-500">
                        {driver.vehicleNumber ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {driverPhone ? (
                      <a
                        href={`tel:${driverPhone}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-50"
                      >
                        <Phone className="h-4 w-4" /> Call Driver
                      </a>
                    ) : (
                      /* No phone on the ride payload — wire your calling flow here. */
                      <button
                        type="button"
                        disabled
                        title="Driver phone number is not available on this ride payload"
                        className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-400"
                      >
                        <Phone className="h-4 w-4" /> Call Driver
                      </button>
                    )}

                    {MESSAGING_ENABLED ? (
                      <button
                        type="button"
                        /* >>> CHANGE ME #4 — connect your existing messaging flow here. */
                        onClick={() => navigate(`/messages/${String(driver.id ?? "")}`)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-50"
                      >
                        <MessageSquare className="h-4 w-4" /> Message
                      </button>
                    ) : null}
                  </div>
                </AppCard>
              ) : null}

              {/* Trip facts */}
              <AppCard className="p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Trip</h3>

                <div className="mt-4 space-y-4">
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-neutral-500">Pickup</p>
                      <p className="break-words text-sm font-medium text-neutral-900">{ride.pickupAddress ?? "—"}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white">
                      <Navigation className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-neutral-500">Destination</p>
                      <p className="break-words text-sm font-medium text-neutral-900">{ride.dropAddress ?? "—"}</p>
                    </div>
                  </div>
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-neutral-200 pt-4">
                  <div className="rounded-xl bg-neutral-50 p-3">
                    <dt className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                      <RouteIcon className="h-3.5 w-3.5" /> Distance
                    </dt>
                    <dd className="mt-1 text-base font-semibold text-neutral-900">{km(ride.distance)}</dd>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-3">
                    <dt className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                      <CircleDollarSign className="h-3.5 w-3.5" /> Est. fare
                    </dt>
                    <dd className="mt-1 text-base font-semibold text-neutral-900">{money(ride.fare ?? ride.profit)}</dd>
                  </div>
                </dl>

                <p className="mt-4 text-xs text-neutral-500">
                  Ride ID:{" "}
                  <span className="font-mono text-neutral-700">{String(ride.rideId ?? ride.id ?? rideId)}</span>
                </p>
              </AppCard>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
