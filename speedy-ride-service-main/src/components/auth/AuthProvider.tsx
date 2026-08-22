import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const initializeAuth = useAuthStore((s) => s.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}