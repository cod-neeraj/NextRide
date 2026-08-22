import { create } from "zustand";
import type { Ride } from "@/types";

interface RideState {
  activeRide: Ride | null;
  setActiveRide: (ride: Ride | null) => void;
  clearRide: () => void;
}

export const useRideStore = create<RideState>((set) => ({
  activeRide: null,
  setActiveRide: (ride) => set({ activeRide: ride }),
  clearRide: () => set({ activeRide: null }),
}));
