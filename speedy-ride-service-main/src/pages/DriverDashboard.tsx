import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  TrendingUp,
  MapPin,
  Navigation,
  Check,
  Play,
  Flag,
  AlertTriangle,
  ShieldAlert,
  PhoneCall,
  ShieldCheck,
  Route,
  IndianRupee,
  Clock,
} from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Switch } from "@/components/ui/switch";
import { driverApi } from "@/services/instances";
import { formatINR } from "@/lib/format";
import type { Ride, RideStatus } from "@/types";
import { useWebSocket } from "@/context/WebSocketContext";

type DriverStatus =
    "OFFLINE" |
    "ONLINE" |
    "AVAILABLE" |
    "ON_RIDE" |
    "BLOCKED";

  type DriverDocumentsStatus =
  |  "PENDING"
  |  "UNVERIFIED"
  |  "VERIFIED"
  |  "REJECTED";

interface DashboardResponse {
  status: DriverStatus;
  documentStatus: DriverDocumentsStatus;
  message?: string | null;
  averageRatings: number;
  todayEarnings: number;
  todayTotalRides: number;
  driverRideResponseList: Ride[];
  incomingRide?: Ride | null;
  activeRide?: Ride | null;
}

export function DriverDashboard() {
  const navigate = useNavigate();

  const { subscribe, isConnected } = useWebSocket();

  const [driverStatus, setDriverStatus] = useState<DriverStatus | null>(null);
  const [documentStatus, setDocumentStatus] =
    useState<DriverDocumentsStatus | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [available, setAvailable] = useState(false);
  const [incoming, setIncoming] = useState<Ride | null>(null);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);

  const [recentRides, setRecentRides] = useState<Ride[]>([]);
  const [averageRatings, setAverageRatings] = useState(0);

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // =========================================================
  // FETCH DASHBOARD
  // =========================================================

  const fetchDashboard = useCallback(async () => {
    try {
      const { data } = await driverApi.get<{
        data: DashboardResponse;
      }>("/driver/dashboard");

      const d = data.data;

      console.log("Dashboard data:", d);

      setDriverStatus(d.status);
      setDocumentStatus(d.documentStatus);
      setStatusMessage(d.message ?? null);
      setAverageRatings(d.averageRatings ?? 0);

      // Backend driver status is the source of truth for availability.
      setAvailable(d.status === "AVAILABLE");

      if (d.documentStatus === "VERIFIED") {
        setIncoming(d.incomingRide ?? null);
        setActiveRide(d.activeRide ?? null);
        setRecentRides(d.driverRideResponseList ?? []);
      } else {
        setIncoming(null);
        setActiveRide(null);
        setRecentRides([]);
      }
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      toast.error("Failed to load dashboard");
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // =========================================================
  // WEBSOCKET - REAL TIME RIDE OFFER
  // =========================================================

  useEffect(() => {
    if (
      documentStatus !== "VERIFIED" ||
      driverStatus !== "AVAILABLE" ||
      !available
    ) {
      return;
    }

    const unsubscribe = subscribe(
      "/user/queue/ride-offer",
      (offer: Ride) => {
        console.log("Received ride offer via WS:", offer);

        if (!activeRide) {
          setIncoming(offer);
          toast.success("New ride request received!");
        }
      }
    );

    return unsubscribe;
  }, [
    documentStatus,
    driverStatus,
    available,
    activeRide,
    subscribe,
  ]);


  // =========================================================
  // TOGGLE DRIVER AVAILABILITY
  // =========================================================

  const toggleAvailability = async (value: boolean) => {
    const previousValue = available;

    if (value) {
      if (!navigator.geolocation) {
        toast.error(
          "Geolocation is not supported on this device"
        );
        return;
      }

      setAvailable(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const {
            latitude,
            longitude,
          } = position.coords;

          try {
            await driverApi.patch(
              "/rider/others/status",
              {
                available: true,
                longitude,
                latitude,
              }
            );

            setAvailable(true);
            setDriverStatus("AVAILABLE");

            toast.success(
              "You're now available for rides"
            );
          } catch (error) {
            console.error(
              "Availability update failed:",
              error
            );

            setAvailable(previousValue);

            toast.error(
              "Couldn't update availability"
            );
          }
        },
        () => {
          setAvailable(previousValue);

          toast.error(
            "Couldn't get your location. Check location permissions."
          );
        }
      );
    } else {
      setAvailable(false);

      try {
        await driverApi.patch(
          "/rider/others/status",
          {
            available: false,
          }
        );

        setAvailable(false);
        setDriverStatus("OFFLINE");
        setIncoming(null);

        toast.success(
          "You're now offline"
        );
      } catch (error) {
        console.error(
          "Availability update failed:",
          error
        );

        setAvailable(previousValue);

        toast.error(
          "Couldn't update availability"
        );
      }
    }
  };

  // =========================================================
  // ACCEPT RIDE
  // =========================================================

  const accept = async () => {
    if (!incoming) return;

    setLoadingAction("accept");

    try {
      await driverApi.patch(
        `/api/rides/${incoming.rideId}`,
        {
          status: "DRIVER_ASSIGNED",
        }
      );

      const acceptedRide: Ride = {
        ...incoming,
      };

      setActiveRide(acceptedRide);
      setIncoming(null);

      toast.success("Ride accepted!");
    } catch (error) {
      console.error(
        "Failed to accept ride:",
        error
      );

      toast.error("Failed to accept ride");
    } finally {
      setLoadingAction(null);
    }
  };

  // =========================================================
  // REJECT RIDE
  // =========================================================

  const reject = async () => {
    if (!incoming) return;

    setLoadingAction("reject");

    try {
      await driverApi.patch(
        `/api/rides/${incoming.rideId}`,
        {
          status: "REJECTED",
        }
      );

      setIncoming(null);

      toast.success("Ride rejected");
    } catch (error) {
      console.error(
        "Failed to reject ride:",
        error
      );

      toast.error("Failed to reject ride");
    } finally {
      setLoadingAction(null);
    }
  };

  // =========================================================
  // ADVANCE ACTIVE RIDE
  // =========================================================

  const advance = async (
    next: RideStatus,
    label: string
  ) => {
    if (!activeRide) return;

    setLoadingAction(next);

    try {
      await driverApi.patch(
        `/api/rides/${activeRide.rideId}`,
        {
          status: next,
        }
      );

      if (next === "COMPLETED") {
        toast.success(
          `Ride completed! ${formatINR(
            activeRide.profit
          )} earned.`
        );

        setRecentRides((previous) => [
          {
            ...activeRide,
          },
          ...previous,
        ]);

        setActiveRide(null);

        // Driver should normally become available again
        setAvailable(true);
      } else {
        setActiveRide({
          ...activeRide,
        });

        toast.success(label);
      }
    } catch (error) {
      console.error(
        "Failed to update ride status:",
        error
      );

      toast.error(
        "Failed to update ride status"
      );
    } finally {
      setLoadingAction(null);
    }
  };

  // =========================================================
  // CALCULATED STATS
  // =========================================================

  const todayRides = recentRides;

  const todayEarnings = todayRides.reduce(
    (total, ride) =>
      total + (ride.profit ?? 0),
    0
  );

  const averageDistance =
    todayRides.length > 0
      ? todayRides.reduce(
          (total, ride) =>
            total + (ride.distance ?? 0),
          0
        ) / todayRides.length
      : 0;

  // =========================================================
  // LOADING
  // =========================================================

  if (loadingDashboard) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <p className="text-sm text-muted-foreground">
            Loading dashboard…
          </p>
        </main>
      </div>
    );
  }

  // =========================================================
  // DOCUMENTS PENDING - DRIVER MUST SUBMIT DOCUMENTS
  // =========================================================

  if (documentStatus === "PENDING") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <AppCard className="border-warning/40 ring-2 ring-warning/10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />

              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground">
                  Submit your documents
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {statusMessage ??
                    "Please submit your required documents to start the verification process."}
                </p>

                <AppButton
                  className="mt-4"
                  onClick={() => navigate("/driver/profile/verify")}
                >
                  Submit documents
                </AppButton>
              </div>
            </div>
          </AppCard>
        </main>
      </div>
    );
  }

  // =========================================================
  // DOCUMENTS UNDER VERIFICATION
  // =========================================================

  if (documentStatus === "UNVERIFIED") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <AppCard className="border-accent/40 ring-2 ring-accent/10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <ShieldCheck className="h-6 w-6 text-accent" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-foreground">
              Documents under verification
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {statusMessage ??
                "We've received your documents. Our team is currently reviewing them."}
            </p>

            <div className="mt-5 flex justify-center">
              <AppButton
                variant="outline"
                onClick={() => navigate("/driver/profile/verify")}
              >
                View submitted documents
              </AppButton>
            </div>
          </AppCard>
        </main>
      </div>
    );
  }

  // =========================================================
  // DOCUMENTS REJECTED - RESUBMIT
  // =========================================================

  if (documentStatus === "REJECTED") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <AppCard className="border-danger/40 ring-2 ring-danger/10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
              <ShieldAlert className="h-6 w-6 text-danger" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-foreground">
              Verification rejected
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {statusMessage ??
                "Your documents were rejected. Please review and resubmit them."}
            </p>

            <div className="mt-5 flex justify-center">
              <AppButton
                onClick={() => navigate("/driver/profile/verify")}
              >
                Resubmit documents
              </AppButton>
            </div>
          </AppCard>
        </main>
      </div>
    );
  }

  // =========================================================
  // DRIVER BLOCKED
  // =========================================================

  if (driverStatus === "BLOCKED") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <AppCard className="border-danger/40 ring-2 ring-danger/10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
              <ShieldAlert className="h-6 w-6 text-danger" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-foreground">
              Account blocked
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {statusMessage ??
                "Your driver account has been blocked. Please contact support."}
            </p>

            <AppButton
              className="mt-5"
              variant="outline"
              onClick={() => navigate("/support")}
            >
              <PhoneCall className="h-4 w-4" />
              Contact support
            </AppButton>
          </AppCard>
        </main>
      </div>
    );
  }

  // =========================================================
  // ACTIVE DRIVER DASHBOARD
  // =========================================================

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Driver Dashboard
            </h1>

            <p className="text-sm text-muted-foreground">
              Manage your rides, availability and earnings.
            </p>
          </div>

          <AppCard className="!p-3 flex items-center gap-3">
            <StatusBadge
              status={
                driverStatus === "AVAILABLE"
                  ? "AVAILABLE"
                  : driverStatus === "ON_RIDE"
                    ? activeRide?.status ?? "OFFLINE"
                    : "OFFLINE"
              }
            />

            <Switch
              checked={driverStatus === "ONLINE"}
              onCheckedChange={toggleAvailability}
              disabled={driverStatus === "ON_RIDE"}
            />

            <span className="text-xs text-muted-foreground">
              {isConnected
                ? "Connected"
                : "Disconnected"}
            </span>
          </AppCard>
        </div>

        {/* =====================================================
            STATS
        ===================================================== */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <AppCard>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Today's earnings
            </div>

            <p className="mt-2 text-3xl font-bold text-foreground">
              {formatINR(
                todayEarnings
              )}
            </p>
          </AppCard>

          <AppCard>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <Check className="h-4 w-4" />
              Completed rides
            </div>

            <p className="mt-2 text-3xl font-bold text-foreground">
              {todayRides.length}
            </p>
          </AppCard>

          <AppCard>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <Route className="h-4 w-4" />
              Avg. distance
            </div>

            <p className="mt-2 text-3xl font-bold text-foreground">
              {averageDistance.toFixed(1)}
              <span className="ml-1 text-base font-medium">
                km
              </span>
            </p>
          </AppCard>

          <AppCard>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <IndianRupee className="h-4 w-4" />
              Rating
            </div>

            <p className="mt-2 text-3xl font-bold text-foreground">
              {averageRatings.toFixed(1)}
            </p>
          </AppCard>

        </div>

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* ===================================================
              LEFT SIDE
          =================================================== */}

          <div className="space-y-6 lg:col-span-2">

            {/* =================================================
                INCOMING RIDE
            ================================================= */}

            {available &&
              incoming &&
              !activeRide && (
                <AppCard className="border-accent/40 ring-2 ring-accent/10">

                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-foreground">
                      New ride request
                    </h3>

                    <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning">
                      Action needed
                    </span>
                  </div>

                  {/* Ride details */}

                  <div className="mt-5 space-y-4">

                    {/* Pickup */}

                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10">
                        <MapPin className="h-4 w-4 text-success" />
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Pickup
                        </p>

                        <p className="text-sm font-medium text-foreground">
                          {incoming.pickupAddress}
                        </p>
                      </div>
                    </div>

                    {/* Drop */}

                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
                        <Navigation className="h-4 w-4 text-accent" />
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Drop
                        </p>

                        <p className="text-sm font-medium text-foreground">
                          {incoming.dropAddress}
                        </p>
                      </div>
                    </div>

                    {/* Distance */}

                    <div className="flex items-center justify-between border-t border-border pt-4">

                      <div className="flex items-center gap-2">
                        <Route className="h-4 w-4 text-muted-foreground" />

                        <span className="text-sm text-muted-foreground">
                          Distance
                        </span>
                      </div>

                      <span className="font-semibold text-foreground">
                        {incoming.distance.toFixed(
                          1
                        )}{" "}
                        km
                      </span>

                    </div>

                    {/* Profit */}

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4 text-success" />

                        <span className="text-sm text-muted-foreground">
                          Estimated earnings
                        </span>
                      </div>

                      <span className="text-xl font-bold text-success">
                        {formatINR(
                          incoming.profit
                        )}
                      </span>

                    </div>

                    {/* Expiration */}

                    {incoming.expiresInSeconds !==
                      undefined && (
                      <div className="flex items-center justify-between rounded-lg bg-warning/10 px-3 py-2">

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-warning" />

                          <span className="text-sm text-warning">
                            Offer expires in
                          </span>
                        </div>

                        <span className="font-bold text-warning">
                          {
                            incoming.expiresInSeconds
                          }
                          s
                        </span>

                      </div>
                    )}

                  </div>

                  {/* Buttons */}

                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <AppButton
                      variant="danger"
                      loading={
                        loadingAction ===
                        "reject"
                      }
                      onClick={reject}
                    >
                      Reject
                    </AppButton>

                    <AppButton
                      variant="success"
                      loading={
                        loadingAction ===
                        "accept"
                      }
                      onClick={accept}
                    >
                      Accept
                    </AppButton>

                  </div>

                </AppCard>
              )}

            {/* =================================================
                ACTIVE RIDE
            ================================================= */}

            {activeRide && (
              <AppCard>

                <div className="flex items-center justify-between">

                  <h3 className="text-base font-semibold text-foreground">
                    Active ride
                  </h3>

                  <StatusBadge
                    status={
                      activeRide.status
                    }
                  />

                </div>

                <div className="mt-5 space-y-4">

                  {/* Pickup */}

                  <div className="flex items-start gap-3">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10">
                      <MapPin className="h-4 w-4 text-success" />
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Pickup
                      </p>

                      <p className="text-sm font-medium text-foreground">
                        {
                          activeRide.pickupAddress
                        }
                      </p>
                    </div>

                  </div>

                  {/* Drop */}

                  <div className="flex items-start gap-3">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
                      <Navigation className="h-4 w-4 text-accent" />
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Drop
                      </p>

                      <p className="text-sm font-medium text-foreground">
                        {
                          activeRide.dropAddress
                        }
                      </p>
                    </div>

                  </div>

                  {/* Distance */}

                  <div className="flex items-center justify-between border-t border-border pt-4">

                    <span className="text-sm text-muted-foreground">
                      Distance
                    </span>

                    <span className="font-semibold">
                      {
                        activeRide.distance.toFixed(
                          1
                        )
                      }{" "}
                      km
                    </span>

                  </div>

                  {/* Profit */}

                  <div className="flex items-center justify-between">

                    <span className="text-sm text-muted-foreground">
                      Earnings
                    </span>

                    <span className="text-xl font-bold text-success">
                      {formatINR(
                        activeRide.profit
                      )}
                    </span>

                  </div>

                </div>

                {/* Status buttons */}

                <div className="mt-5 grid gap-2 sm:grid-cols-3">

                  <AppButton
                    variant="outline"
                    disabled={
                      activeRide.status !==
                      "DRIVER_ASSIGNED"
                    }
                    loading={
                      loadingAction ===
                      "DRIVER_ARRIVED"
                    }
                    onClick={() =>
                      advance(
                        "DRIVER_ARRIVED",
                        "Marked as arrived"
                      )
                    }
                  >
                    <Check className="h-4 w-4" />
                    Arrived
                  </AppButton>

                  <AppButton
                    variant="secondary"
                    disabled={
                      activeRide.status !==
                      "DRIVER_ARRIVED"
                    }
                    loading={
                      loadingAction ===
                      "IN_PROGRESS"
                    }
                    onClick={() =>
                      advance(
                        "IN_PROGRESS",
                        "Ride started"
                      )
                    }
                  >
                    <Play className="h-4 w-4" />
                    Start
                  </AppButton>

                  <AppButton
                    variant="success"
                    disabled={
                      activeRide.status !==
                      "IN_PROGRESS"
                    }
                    loading={
                      loadingAction ===
                      "COMPLETED"
                    }
                    onClick={() =>
                      advance(
                        "COMPLETED",
                        "Ride completed"
                      )
                    }
                  >
                    <Flag className="h-4 w-4" />
                    Complete
                  </AppButton>

                </div>

              </AppCard>
            )}

            {/* =================================================
                WAITING
            ================================================= */}

            {!incoming &&
              !activeRide &&
              available && (
                <AppCard className="text-center">

                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                    <Navigation className="h-5 w-5 text-accent" />
                  </div>

                  <p className="text-sm font-medium text-foreground">
                    Waiting for ride requests
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Stay online to receive new ride offers.
                  </p>

                </AppCard>
              )}

            {/* =================================================
                OFFLINE
            ================================================= */}

            {!available && (
              <AppCard className="text-center">

                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Navigation className="h-5 w-5 text-muted-foreground" />
                </div>

                <p className="text-sm font-medium text-foreground">
                  You're offline
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Toggle availability to receive ride requests.
                </p>

              </AppCard>
            )}

          </div>

          {/* ===================================================
              RIGHT SIDE
          =================================================== */}

          <div className="space-y-6">

            {/* Earnings */}

            <AppCard className="bg-primary text-primary-foreground border-primary">

              <div className="flex items-center gap-2 text-xs uppercase tracking-wide opacity-80">
                <TrendingUp className="h-4 w-4" />
                Today's earnings
              </div>

              <p className="mt-3 text-4xl font-extrabold">
                {formatINR(
                  todayEarnings
                )}
              </p>

              <p className="mt-1 text-sm opacity-80">
                {todayRides.length} completed rides
              </p>

            </AppCard>

            {/* Recent rides */}

            <AppCard>

              <h3 className="text-base font-semibold text-foreground">
                Recent rides
              </h3>

              {recentRides.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  No rides completed yet.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-border">

                  {recentRides.map((ride) => (

                    <li
                      key={ride.rideId}
                      className="py-4"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <div className="flex items-start gap-2">

                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-success" />

                            <p className="truncate text-sm font-medium text-foreground">
                              {
                                ride.pickupAddress
                              }
                            </p>

                          </div>

                          <div className="mt-1 flex items-start gap-2">

                            <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-accent" />

                            <p className="truncate text-sm text-muted-foreground">
                              {
                                ride.dropAddress
                              }
                            </p>

                          </div>

                          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">

                            <span>
                              {ride.distance.toFixed(
                                1
                              )}{" "}
                              km
                            </span>

                          </div>

                        </div>

                        <div className="shrink-0 text-right">

                          <p className="text-sm font-bold text-success">
                            {formatINR(
                              ride.profit
                            )}
                          </p>

                        </div>

                      </div>

                    </li>

                  ))}

                </ul>
              )}

            </AppCard>

          </div>

        </div>
      </main>
    </div>
  );
}