// src/lib/authRouting.ts
// Single source of truth for "where should this user land right now".
// Used both right after login and on app boot (session-cookie restore),
// so the rule only ever lives in one place.

export type Role = "RIDER" | "DRIVER";
export type DriverStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "DELETED"
  | "UNVERIFIED"
  | "REJECTED";

export function resolveRedirectPath(role: Role, driverStatus?: DriverStatus) {
  if (role === "RIDER") return "/dashboard";
  else return "/driver/home";
}