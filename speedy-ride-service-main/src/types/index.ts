export type Role = "RIDER" | "DRIVER";

export type RideStatus =
  | "REQUESTED"
  | "DRIVER_ASSIGNED"
  | "DRIVER_ARRIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plate: string;
  rating: number;
}

export interface Ride {
  rideId: string;
  pickupAddress: string;
  dropAddress: string;
  distance: number;
  profit: number;
  status: RideStatus;
  expiresInSeconds?: number;
}
