import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  BadgeCheck,
  Car,
  CircleDollarSign,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Route as RouteIcon,
  User,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import AppCard from "@/components/AppCard";
import AppButton from "@/components/AppButton";
import StatusBadge from "@/components/StatusBadge";
import { driverApi } from "@/services/instances";
import { useWebSocket } from "@/hooks/useWebSocket";
import MapPlaceholder from "@/components/ride/MapPlaceholder";

/* ============================================================================
 * >>> CHANGE ME #1 — real-time destination
 * The STOMP destination this page listens on for ride status / driver location.
 * ==========================================================================*/
const RIDE_STATUS_DESTINATION = "/user/queue/ride-status";

/* ============================================================================
 * Types
 * If you already export a `Ride` type, replace `RideLike` with:
 *   import type { Ride } from "@/types";
 * and set `type RideLike = Ride;`
 * ==========================================================================*/
export type RideStatus =
  | "REQUESTED"
  | "DRIVER_ASSIGNED"
  | "DRIVER_ARRIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface RidePassenger {
  id?: string | number;
  name?: string;
  fullName?: string;
  phone?: string;
  phoneNumber?: string;
  rating?: number;
  avatarUrl?: string;
}

export interface RideLike {
  id?: string | number;
  rideId?: string | number;
  status: RideStatus;
  pickupAddress?: string;
  dropAddress?: string;
  distance?: number;
  profit?: number;
  fare?: number;
  pickupLatitude?: number;
  pickupLongitude?: number;
  dropLatitude?: number;
  dropLongitude?: number;
  driverLatitude?: number;
  driverLongitude?: number;
  passenger?: RidePassenger | null;
  user?: RidePassenger | null;
}

interface RideStatusEvent {
  rideId: string | number;
  status: RideStatus;
  driverLatitude?: number;
  driverLongitude?: number;
}

/** Only these transitions are ever allowed. */
const NEXT_STATUS: Partial<Record<RideStatus, RideStatus>> = {
  DRIVER_ASSIGNED: "DRIVER_ARRIVED",
  DRIVER_ARRIVED: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
};

const STEP_COPY: Record<string, { headline: string; hint: string; action: string }> = {
  DRIVER_ASSIGNED: {
    headline: "Navigate to pickup",
    hint: "Head to the pickup point and let the passenger know you're close.",
    action: "Arrived at Pickup",
  },
  DRIVER_ARRIVED: {
    headline: "Waiting for passenger",
    hint: "You're at the pickup point. Start the ride once the passenger is on board.",
    action: "Start Ride",
  },
  IN_PROGRESS: {
    headline: "Ride in progress",
    hint: "Drive safely to the destination and complete the ride on arrival.",
    action: "Complete Ride",
  },
};

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

function passengerOf(ride: RideLike | null): RidePassenger | null {
  return ride?.passenger ?? ride?.user ?? null;
}

function nameOf(p: RidePassenger | null): string {
  return p?.name ?? p?.fullName ?? "Passenger";
}

function phoneOf(p: RidePassenger | null): string | undefined {
  return p?.phone ?? p?.phoneNumber;
}

/**
 * Subscribes through the app's single WebSocket connection.
 * Supports both a `subscribe(destination, cb)` helper and a raw STOMP client.
 * Trim this to whichever shape your `useWebSocket()` exposes.
 */
type WsLike = {
  connected?: boolean;
  isConnected?: boolean;
  subscribe?: (destination: string, cb: (payload: unknown) => void) => (() => void) | { unsubscribe: () => void };
  client?: {
    connected?: boolean;
    subscribe: (destination: string, cb: (message: { body: string }) => void) => { unsubscribe: () => void };
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

export default function DriverActiveRide() {
  const { rideId = "" } = useParams<{ rideId: string }>();
  const navigate = useNavigate();
  const ws = useWebSocket() as unknown as WsLike;

  const [ride, setRide] = useState<RideLike | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [driverPosition, setDriverPosition] = useState<{ latitude: number; longitude: number } | null>(null);

  const rideIdRef = useRef(rideId);
  rideIdRef.current = rideId;

  /* ==========================================================================
   * >>> CHANGE ME #2 — fetch a single ride (used on load / refresh)
   * Point this at your real endpoint, e.g.
   *   const { data } = await driverApi.get(`/api/rides/${id}`);
   *   return data as RideLike;
   * ========================================================================*/
  const fetchRide = useCallback(async (id: string): Promise<RideLike> => {
    const response = await driverApi.get(`/api/rides/${id}`);
    const payload = (response as { data?: unknown })?.data ?? response;
    return payload as RideLike;
  }, []);

  /* ==========================================================================
   * >>> CHANGE ME #3 — status update endpoint (PATCH /api/rides/{rideId})
   * ========================================================================*/
  const patchRideStatus = useCallback(async (id: string, status: RideStatus): Promise<RideLike | null> => {
    const response = await driverApi.patch(`/api/rides/${id}`, { status });
    const payload = (response as { data?: unknown })?.data ?? response;
    return (payload ?? null) as RideLike | null;
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

  // Live updates — WebSocket only, no polling.
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
  const nextStatus = status ? NEXT_STATUS[status] : undefined;
  const copy = status ? STEP_COPY[status] : undefined;
  const passenger = useMemo(() => passengerOf(ride), [ride]);
  const passengerPhone = phoneOf(passenger);

  const advance = useCallback(async () => {
    if (!ride || !nextStatus || updating) return;
    setUpdating(true);
    try {
      const updated = await patchRideStatus(rideId, nextStatus);
      setRide((prev) => {
        if (updated && typeof updated === "object" && "status" in updated) return updated;
        return prev ? { ...prev, status: nextStatus } : prev;
      });
      toast.success(
        nextStatus === "DRIVER_ARRIVED"
          ? "Marked as arrived at pickup"
          : nextStatus === "IN_PROGRESS"
            ? "Ride started"
            : "Ride completed",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the ride status.");
    } finally {
      setUpdating(false);
    }
  }, [nextStatus, patchRideStatus, ride, rideId, updating]);

  const backToDashboard = useCallback(() => {
    navigate("/driver/dashboard");
  }, [navigate]);

  const pickupCoords = coordOrNull(ride?.pickupLatitude, ride?.pickupLongitude);
  const dropCoords = coordOrNull(ride?.dropLatitude, ride?.dropLongitude);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={backToDashboard}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">Active Ride</h1>
              <p className="text-sm text-neutral-500">Trip #{String(ride?.rideId ?? ride?.id ?? rideId)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 sm:self-auto">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
            </span>
            Online · On trip
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {loading ? (
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="h-[320px] animate-pulse rounded-2xl bg-neutral-200 sm:h-[420px] lg:h-[560px]" />
            <div className="space-y-4">
              <div className="h-40 animate-pulse rounded-2xl bg-neutral-200" />
              <div className="h-56 animate-pulse rounded-2xl bg-neutral-200" />
            </div>
          </div>
        ) : loadError || !ride ? (
          <AppCard className="mx-auto max-w-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-neutral-900">We couldn't load this ride</h2>
            <p className="mt-2 text-sm text-neutral-500">{loadError ?? "Ride not found."}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <AppButton onClick={() => void loadRide()}>Try again</AppButton>
              <AppButton variant="secondary" onClick={backToDashboard}>
                Back to Dashboard
              </AppButton>
            </div>
          </AppCard>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            {/* Map */}
            <section>
              <MapPlaceholder
                pickup={pickupCoords}
                drop={dropCoords}
                driver={driverPosition}
                live={status === "IN_PROGRESS" || status === "DRIVER_ASSIGNED"}
              />
            </section>

            {/* Ride info + actions */}
            <aside className="space-y-4">
              <AppCard className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Current status</p>
                    <h2 className="mt-1 text-lg font-semibold text-neutral-900">
                      {status === "COMPLETED" ? "Ride completed" : (copy?.headline ?? "Awaiting update")}
                    </h2>
                  </div>
                  <StatusBadge status={status} />
                </div>

                <p className="mt-2 text-sm text-neutral-500">
                  {status === "COMPLETED"
                    ? "Nice work. Your earnings have been recorded."
                    : (copy?.hint ?? "This ride is not in an actionable state right now.")}
                </p>

                {status === "COMPLETED" ? (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      <BadgeCheck className="h-4 w-4" /> Final earnings
                    </p>
                    <p className="mt-1 text-2xl font-bold text-emerald-800">{money(ride.profit ?? ride.fare)}</p>
                  </div>
                ) : null}

                <div className="mt-5">
                  {status === "COMPLETED" ? (
                    <AppButton className="w-full" onClick={backToDashboard}>
                      Back to Dashboard
                    </AppButton>
                  ) : nextStatus && copy ? (
                    <AppButton className="w-full" disabled={updating} onClick={() => void advance()}>
                      {updating ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Updating…
                        </span>
                      ) : (
                        copy.action
                      )}
                    </AppButton>
                  ) : (
                    <AppButton className="w-full" variant="secondary" onClick={backToDashboard}>
                      Back to Dashboard
                    </AppButton>
                  )}
                </div>
              </AppCard>

              <AppCard className="p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Trip details</h3>

                <div className="mt-4 space-y-4">
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-neutral-500">Pickup</p>
                      <p className="break-words text-sm font-medium text-neutral-900">
                        {ride.pickupAddress ?? "—"}
                      </p>
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
                      <CircleDollarSign className="h-3.5 w-3.5" /> Earnings
                    </dt>
                    <dd className="mt-1 text-base font-semibold text-neutral-900">
                      {money(ride.profit ?? ride.fare)}
                    </dd>
                  </div>
                </dl>

                <p className="mt-4 flex items-center gap-1.5 text-xs text-neutral-500">
                  <Car className="h-3.5 w-3.5" /> Ride ID:{" "}
                  <span className="font-mono text-neutral-700">{String(ride.rideId ?? ride.id ?? rideId)}</span>
                </p>
              </AppCard>

              {passenger ? (
                <AppCard className="p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Passenger</h3>
                  <div className="mt-4 flex items-center gap-3">
                    {passenger.avatarUrl ? (
                      <img
                        src={passenger.avatarUrl}
                        alt={nameOf(passenger)}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-200 text-neutral-600">
                        <User className="h-5 w-5" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-900">{nameOf(passenger)}</p>
                      {typeof passenger.rating === "number" ? (
                        <p className="text-xs text-neutral-500">{passenger.rating.toFixed(1)} rating</p>
                      ) : null}
                    </div>
                  </div>

                  {passengerPhone ? (
                    <a
                      href={`tel:${passengerPhone}`}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-50"
                    >
                      <Phone className="h-4 w-4" /> Call passenger
                    </a>
                  ) : null}
                </AppCard>
              ) : null}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
