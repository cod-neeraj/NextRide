import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MapPin,
  Navigation,
  Calculator,
  LocateFixed,
  Route,
  IndianRupee,
} from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MapPlaceholder } from "@/components/maps/MapPlaceholder";
import { useWebSocket } from "@/context/WebSocketContextUser";

import { useRideStore } from "@/stores/rideStore";
import { formatINR } from "@/lib/format";

import { DUMMY_RIDES } from "@/lib/dummyData";

import type { Ride } from "@/types";

import { rideApi } from "@/services/instances";
import { estimateFare } from "@/services/rideApi";

// =========================================================
// TYPES
// =========================================================

type GeoPoint = {
  address: string;
  lat: number;
  lng: number;
};

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

type RideDetails = {
  vehicleType: string;

  pickup_address: string;
  pickupLat: number;
  pickupLng: number;

  dropoff_address: string;
  dropoffLat: number;
  dropoffLng: number;
};

type EstimateDetails = {
  pickupLat: number;
  pickupLng: number;

  dropoffLat: number;
  dropoffLng: number;
};

type FareEstimates = Record<string, number>;

// =========================================================
// LOCATION AUTOCOMPLETE
// =========================================================

function LocationAutocomplete({
  label,
  placeholder,
  icon,
  value,
  onSelect,
  showUseMyLocation,
  onLocatingChange,
}: {
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  value: GeoPoint | null;
  onSelect: (point: GeoPoint) => void;
  showUseMyLocation?: boolean;
  onLocatingChange?: (locating: boolean) => void;
}) {
  const [query, setQuery] = useState(
    value?.address ?? ""
  );

  const [results, setResults] =
    useState<NominatimResult[]>([]);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const wrapperRef =
    useRef<HTMLDivElement>(null);

  // =======================================================
  // SEARCH
  // =======================================================

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            query
          )}&format=json&limit=5&addressdetails=0`
        );

        const data: NominatimResult[] =
          await res.json();

        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // =======================================================
  // CLOSE DROPDOWN
  // =======================================================

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          e.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClick
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClick
      );
  }, []);

  // =======================================================
  // SELECT LOCATION
  // =======================================================

  function handlePick(
    result: NominatimResult
  ) {
    const point: GeoPoint = {
      address: result.display_name,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };

    setQuery(result.display_name);

    onSelect(point);

    setOpen(false);
  }

  // =======================================================
  // CURRENT LOCATION
  // =======================================================

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      toast.error(
        "Geolocation not supported on this device"
      );
      return;
    }

    setLoading(true);
    onLocatingChange?.(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const {
          latitude,
          longitude,
        } = position.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );

          const data =
            await res.json();

          const address =
            data.display_name ??
            "Current location";

          setQuery(address);

          onSelect({
            address,
            lat: latitude,
            lng: longitude,
          });
        } catch {
          setQuery("Current location");

          onSelect({
            address: "Current location",
            lat: latitude,
            lng: longitude,
          });
        } finally {
          setLoading(false);
          onLocatingChange?.(false);
        }
      },
      () => {
        toast.error(
          "Couldn't get your location. Check location permissions."
        );

        setLoading(false);
        onLocatingChange?.(false);
      }
    );
  }

  // =======================================================
  // UI
  // =======================================================

  return (
    <div
      ref={wrapperRef}
      className="relative"
    >
      <AppInput
        label={label}
        value={query}
        onChange={(e) => {
          const value = e.target.value;

          setQuery(value);

          if (value.length === 0) {
            onSelect({
              address: "",
              lat: 0,
              lng: 0,
            });
          }
        }}
        onFocus={() =>
          results.length > 0 &&
          setOpen(true)
        }
        leftIcon={icon}
        placeholder={placeholder}
      />

      {showUseMyLocation && (
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="absolute right-2 top-8 flex items-center gap-1 text-xs text-accent hover:underline"
        >
          <LocateFixed className="h-3.5 w-3.5" />
          Use my location
        </button>
      )}

      {open &&
        (loading || results.length > 0) && (
          <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-background shadow-lg">
            {loading && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Searching…
              </div>
            )}

            {!loading &&
              results.map((result, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() =>
                    handlePick(result)
                  }
                  className="block w-full truncate px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  {result.display_name}
                </button>
              ))}
          </div>
        )}
    </div>
  );
}

// =========================================================
// RIDER DASHBOARD
// =========================================================

export function RiderDashboard() {
  const navigate = useNavigate();
  const { subscribe, isConnected } = useWebSocket();
  const {
    activeRide,
    setActiveRide,
  } = useRideStore();

  const [pickup, setPickup] =
    useState<GeoPoint | null>(null);

  const [dropoff, setDropoff] =
    useState<GeoPoint | null>(null);

  const [estimates, setEstimates] =
    useState<FareEstimates | null>(null);

  const [selectedVehicle, setSelectedVehicle] =
    useState<string | null>(null);

  const [loadingEst, setLoadingEst] =
    useState(false);

  const [loadingBook, setLoadingBook] =
    useState(false);

  const [locatingPickup, setLocatingPickup] =
    useState(false);

  const recent = DUMMY_RIDES as Ride[];

    useEffect(() => {

    const unsubscribe = subscribe(
      "/user/queue/ride-status",
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

  // =======================================================
  // ESTIMATE FARE
  // =======================================================

  const handleEstimate = async () => {
    if (
      !pickup?.lat ||
      !dropoff?.lat
    ) {
      toast.error(
        "Select pickup and drop-off from the suggestions"
      );

      return;
    }

    setLoadingEst(true);

    try {
      const payload: EstimateDetails = {
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,

        dropoffLat: dropoff.lat,
        dropoffLng: dropoff.lng,
      };

      const fares =
        await estimateFare(payload);

      console.log(
        "Fare estimates:",
        fares
      );

      setEstimates(fares);

      setSelectedVehicle(
        Object.keys(fares)[0] ?? null
      );

      toast.success(
        "Fare estimates ready"
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Couldn't estimate fare, try again"
      );
    } finally {
      setLoadingEst(false);
    }
  };

  // =======================================================
  // BOOK RIDE
  // =======================================================

  const handleBook = async () => {
    if (
      !pickup?.lat ||
      !dropoff?.lat
    ) {
      toast.error(
        "Select pickup and drop-off from the suggestions"
      );

      return;
    }

    if (!selectedVehicle) {
      toast.error(
        "Please select a vehicle"
      );

      return;
    }

    setLoadingBook(true);

    try {
      const payload: RideDetails = {
        vehicleType:
          selectedVehicle,

        pickup_address:
          pickup.address,

        pickupLat:
          pickup.lat,

        pickupLng:
          pickup.lng,

        dropoff_address:
          dropoff.address,

        dropoffLat:
          dropoff.lat,

        dropoffLng:
          dropoff.lng,
      };

      const response =
        await rideApi.post(
          "/ride/request",
          payload
        );

      const ride: Ride =
        response.data.data;

      console.log(
        "Created ride:",
        ride
      );

      setActiveRide(ride);

      toast.success(
        "Ride booked! Finding a driver…"
      );

      navigate(
        `/ride/${ride.rideId}`
      );
    } catch (error) {
      console.error(
        "Ride booking failed:",
        error
      );

      toast.error(
        "Couldn't book ride, try again"
      );
    } finally {
      setLoadingBook(false);
    }
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="min-h-screen bg-background">

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Where are you going?
          </h1>

          <p className="text-sm text-muted-foreground">
            Book your next ride in seconds.
          </p>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="grid gap-6 lg:grid-cols-5">

          {/* =================================================
              BOOKING PANEL
          ================================================= */}

          <div className="space-y-6 lg:col-span-2">

            <AppCard>

              <h2 className="text-base font-semibold text-foreground">
                Book a ride
              </h2>

              <div className="mt-4 space-y-3">

                <LocationAutocomplete
                  label="Pickup"
                  placeholder="Where from?"
                  icon={
                    <MapPin className="h-4 w-4 text-success" />
                  }
                  value={pickup}
                  onSelect={setPickup}
                  showUseMyLocation
                  onLocatingChange={
                    setLocatingPickup
                  }
                />

                <LocationAutocomplete
                  label="Drop-off"
                  placeholder="Where to?"
                  icon={
                    <Navigation className="h-4 w-4 text-accent" />
                  }
                  value={dropoff}
                  onSelect={setDropoff}
                />

              </div>

              {/* ============================================
                  FARE ESTIMATES
              ============================================ */}

              {estimates && (
                <div className="mt-4">

                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Choose a ride
                  </p>

                  <div className="grid grid-cols-2 gap-3">

                    {Object.entries(
                      estimates
                    ).map(
                      ([
                        vehicleType,
                        price,
                      ]) => {

                        const isSelected =
                          selectedVehicle ===
                          vehicleType;

                        return (
                          <button
                            key={
                              vehicleType
                            }
                            type="button"
                            onClick={() =>
                              setSelectedVehicle(
                                vehicleType
                              )
                            }
                            className={`flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition ${isSelected
                                ? "border-accent bg-accent/10 ring-1 ring-accent"
                                : "border-border bg-background hover:bg-muted"
                              }`}
                          >
                            <span className="text-sm font-semibold capitalize text-foreground">
                              {
                                vehicleType
                              }
                            </span>

                            <span className="text-lg font-bold text-accent">
                              {formatINR(
                                price
                              )}
                            </span>
                          </button>
                        );
                      }
                    )}

                  </div>

                </div>
              )}

              {/* ============================================
                  ACTION BUTTONS
              ============================================ */}

              <div className="mt-4 grid grid-cols-2 gap-3">

                <AppButton
                  variant="outline"
                  loading={loadingEst}
                  onClick={
                    handleEstimate
                  }
                >
                  <Calculator className="h-4 w-4" />
                  Estimate
                </AppButton>

                <AppButton
                  variant="secondary"
                  loading={loadingBook}
                  onClick={handleBook}
                >
                  Book ride
                </AppButton>

              </div>

            </AppCard>

            {/* =================================================
                ACTIVE RIDE
            ================================================= */}

            {activeRide && (
              <AppCard>

                <div className="flex items-center justify-between">

                  <h3 className="text-base font-semibold text-foreground">
                    Active ride
                  </h3>

                  {/* New Ride doesn't have status.
                      Don't render StatusBadge here unless
                      status is added to the Ride interface. */}

                </div>

                <div className="mt-5 space-y-4">

                  {/* Pickup */}

                  <div className="flex items-start gap-3">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10">
                      <MapPin className="h-4 w-4 text-success" />
                    </div>

                    <div className="min-w-0">

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

                    <div className="min-w-0">

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

                    <div className="flex items-center gap-2">

                      <Route className="h-4 w-4 text-muted-foreground" />

                      <span className="text-sm text-muted-foreground">
                        Distance
                      </span>

                    </div>

                    <span className="font-medium text-foreground">
                      {(activeRide.distance ?? 0).toFixed(
                        1
                      )}{" "}
                      km
                    </span>

                  </div>

                  {/* Profit */}

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <IndianRupee className="h-4 w-4 text-muted-foreground" />

                      <span className="text-sm text-muted-foreground">
                        Ride amount
                      </span>

                    </div>

                    <span className="text-lg font-bold text-foreground">
                      {formatINR(
                        activeRide.profit
                      )}
                    </span>

                  </div>

                  {/* Ride ID */}

                  <div className="rounded-lg bg-muted px-3 py-2">

                    <p className="text-xs text-muted-foreground">
                      Ride ID
                    </p>

                    <p className="mt-1 break-all text-xs font-medium text-foreground">
                      {
                        activeRide.rideId
                      }
                    </p>

                  </div>

                </div>

                <AppButton
                  variant="primary"
                  fullWidth
                  className="mt-4"
                  onClick={() =>
                    navigate(
                      `/ride/${activeRide.rideId}`
                    )
                  }
                >
                  View ride details
                </AppButton>

              </AppCard>
            )}

          </div>

          {/* =================================================
              MAP
          ================================================= */}

          <div className="lg:col-span-3">

            <MapPlaceholder
              pickup={
                pickup?.address ?? ""
              }
              dropoff={
                dropoff?.address ?? ""
              }
            />

          </div>

        </div>

        {/* ===================================================
            RECENT RIDES
        =================================================== */}

        <section className="mt-10">

          <h2 className="text-lg font-semibold text-foreground">
            Recent rides
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">

            {recent.map((ride) => (

              <AppCard
                key={ride.rideId}
                className="!p-4"
              >

                <div className="flex items-center justify-between">

                  <span className="text-xs text-muted-foreground">
                    Ride
                  </span>

                  <span className="text-xs font-medium text-muted-foreground">
                    {(ride.distance ?? 0).toFixed(
                      1
                    )}{" "}
                    km
                  </span>

                </div>

                {/* Pickup */}

                <div className="mt-3 flex items-start gap-2">

                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-success" />

                  <p className="text-sm font-medium text-foreground">
                    {
                      ride.pickupAddress
                    }
                  </p>

                </div>

                {/* Drop */}

                <div className="mt-2 flex items-start gap-2">

                  <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-accent" />

                  <p className="text-sm text-muted-foreground">
                    {
                      ride.dropAddress
                    }
                  </p>

                </div>

                {/* Profit */}

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">

                  <span className="text-xs text-muted-foreground">
                    Ride amount
                  </span>

                  <span className="text-base font-bold text-foreground">
                 {formatINR(ride.profit ?? 0)}
                  </span>

                </div>

              </AppCard>

            ))}

          </div>

        </section>

      </main>

    </div>
  );
}