import { createApi } from "./apiClient";

// One shared axios instance for the ride service
export const api = createApi({
  baseURL:"http://localhost:2023/api"
});

// ---- Types ----
export type GeoPoint = {
  lat: number;
  lng: number;
  address: string;
};

export type BookRidePayload = {
  pickup: GeoPoint;
  destination: GeoPoint;
};
export type EstimateDetails = {
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
}

export type EstimateFareResponse = {
  fare: number;
  distanceKm?: number;
  durationMin?: number;
};
type FareEstimates = Record<string, number>;


export type RideResponse = {
  id: string;
  status: string;
  pickup: string;
  dropoff: string;
  fare: number;
  driver?: {
    name: string;
    vehicle: string;
    plate: string;
  };
  etaMinutes?: number;
};

// ---- Calls ----
export type ApiResponse<T> = {
  data: T;
  success: boolean;
  message: string;
};

export async function estimateFare(payload: EstimateDetails): Promise<FareEstimates> {
  const res = await api.post<ApiResponse<FareEstimates>>("/ride/estimate", payload);
  return res.data.data;
}

export async function bookRide(payload: BookRidePayload): Promise<RideResponse> {
  const res = await api.post<RideResponse>("/rides", payload);
  return res.data;
}