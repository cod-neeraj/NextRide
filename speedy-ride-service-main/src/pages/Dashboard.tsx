import { useAuthStore } from "@/stores/authStore";
import { RiderDashboard } from "./RiderDashboard";
import { DriverDashboard } from "./DriverDashboard";
 
export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
 
  // Guarded by <RequireAuth> in the router (see AuthGuard.tsx),
  // so by the time this renders `user` should exist. This is just
  // a defensive fallback in case someone lands here mid-refresh.
  if (!user) return null;
 
  return user.role === "RIDER" ? <RiderDashboard /> : <DriverDashboard />
  
};