import type { Ride } from "@/types";

export const DUMMY_DRIVER = {
  id: "drv-1",
  name: "Harpreet Singh",
  phone: "+91 98765 43210",
  vehicle: "Swift Dzire",
  plate: "PB-10-AB-1234",
  rating: 4.8,
};

export const DUMMY_RIDER_NAME = "Arjun Sharma";

export const DUMMY_ACTIVE_RIDE: Ride = {
  id: "ride-active-1",
  pickup: "Sector 17, Chandigarh",
  dropoff: "Chandigarh Airport",
  fare: 247,
  status: "DRIVER_ASSIGNED",
  etaMinutes: 4,
  driver: DUMMY_DRIVER,
  createdAt: new Date().toISOString(),
};

export const DUMMY_RIDES: Ride[] = [
  {
    id: "r-1001",
    pickup: "Sector 17, Chandigarh",
    dropoff: "Chandigarh Airport",
    fare: 247,
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "r-1002",
    pickup: "Elante Mall",
    dropoff: "Sukhna Lake",
    fare: 129.5,
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "r-1003",
    pickup: "PGI Hospital",
    dropoff: "Sector 22 Bus Stand",
    fare: 89,
    status: "CANCELLED",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "r-1004",
    pickup: "Rock Garden",
    dropoff: "Sector 35 Market",
    fare: 165,
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export const DUMMY_INCOMING: Ride = {
  id: "incoming-1",
  pickup: "Sector 22, Chandigarh",
  dropoff: "ISBT 43, Chandigarh",
  fare: 178,
  status: "REQUESTED",
  createdAt: new Date().toISOString(),
};
