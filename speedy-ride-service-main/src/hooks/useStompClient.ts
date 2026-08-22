import { useRef, useEffect } from "react";
import { Client } from "@stomp/stompjs";

export const useStompClient = (brokerURL: string) => {
  const stompClient = useRef<Client | null>(null);

  useEffect(() => {
    const client = new Client({
      brokerURL,                      
      reconnectDelay: 5000,     

      
   
      onConnect: () => {
        console.log("STOMP connected");
      },
      onDisconnect: () => {
        console.log("STOMP disconnected");
      },
      onStompError: (frame) => {
        console.error("STOMP error", frame);
      },
    });

    stompClient.current = client;

    // Cleanup on unmount
    return () => {
      client.deactivate();
    };
  }, [brokerURL]);

  return stompClient;
};
