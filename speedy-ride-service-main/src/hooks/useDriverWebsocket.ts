import { useEffect } from "react";
import { useWebSocket } from "@/context/WebSocketContext";
import { useAuthStore } from "@/stores/authStore";

interface UseDriverWebSocketOptions {
  onRideRequest?: (ride: any) => void;
  onRideUpdate?: (update: any) => void;
}

export function useDriverWebSocket({ onRideRequest, onRideUpdate }: UseDriverWebSocketOptions = {}) {
  const { sendLocation, subscribe, isConnected } = useWebSocket();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user?.id) return;

    const unsub1 = subscribe(`/user/${user.id}/queue/ride-request`, (ride) => {
      onRideRequest?.(ride);
    });

    const unsub2 = subscribe(`/user/${user.id}/queue/ride-update`, (update) => {
      onRideUpdate?.(update);
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [user?.id, subscribe]);

  return { sendLocation, isConnected };
}