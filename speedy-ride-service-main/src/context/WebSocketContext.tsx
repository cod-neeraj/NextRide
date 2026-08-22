import { createContext, useContext, useEffect, useRef, useCallback, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuthStore } from "@/stores/authStore";

const WS_URL = "http://localhost:2022/ws";

interface LocationPayload {
  lat: number;
  lng: number;
}

interface WebSocketContextValue {
  sendLocation: (payload: LocationPayload) => void;
  subscribe: (destination: string, callback: (msg: any) => void) => () => void;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const clientRef = useRef<Client | null>(null);
  const connectedRef = useRef(false);
  const [isConnected, setIsConnected] = useState(false);

  const subscriptionsRef = useRef<Map<string, (msg: any) => void>>(new Map());

  useEffect(() => {
    if (!user?.id) return;

  const client = new Client({
    webSocketFactory: () =>
        new SockJS(WS_URL, undefined, {
            withCredentials: true,
        } as any),

    reconnectDelay: 5000,

    debug: (str) => {
        console.log("[STOMP]", str);
    },

    onConnect: () => {
        console.log("🔥 WEBSOCKET CONNECTED:", user.id);

        connectedRef.current = true;
        setIsConnected(true);

        subscriptionsRef.current.forEach((callback, destination) => {
            client.subscribe(destination, (msg) => {
                console.log("📨 MESSAGE:", destination, msg.body);
                callback(JSON.parse(msg.body));
            });
        });
    },

    onDisconnect: () => {
        console.log("❌ WEBSOCKET DISCONNECTED");

        connectedRef.current = false;
        setIsConnected(false);
    },

    onStompError: (frame) => {
        console.error("❌ STOMP ERROR:", frame);

        connectedRef.current = false;
        setIsConnected(false);
    },

    onWebSocketError: (error) => {
        console.error("❌ WEBSOCKET ERROR:", error);
    },
});

    client.activate();
    clientRef.current = client;

    return () => {
      connectedRef.current = false;
      client.deactivate();
      clientRef.current = null;
    };
  }, [user?.id]);

  const subscribe = useCallback((destination: string, callback: (msg: any) => void) => {
    subscriptionsRef.current.set(destination, callback);

    if (clientRef.current && connectedRef.current) {
      clientRef.current.subscribe(destination, (msg) => callback(JSON.parse(msg.body)));
    }

    return () => {
      subscriptionsRef.current.delete(destination);
    };
  }, []);

  const sendLocation = useCallback(({ lat, lng }: LocationPayload) => {
    if (!clientRef.current || !connectedRef.current) {
      console.warn("sendLocation skipped — WS not connected");
      return;
    }
    clientRef.current.publish({
      destination: "/app/driver.location",
      body: JSON.stringify({
        driverId: user?.id,
        lat,
        lng,
        timestamp: Date.now(),
      }),
    });
  }, [user?.id]);

  return (
    <WebSocketContext.Provider value={{ sendLocation, subscribe, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error("useWebSocket must be used inside WebSocketProvider");
  return ctx;
}