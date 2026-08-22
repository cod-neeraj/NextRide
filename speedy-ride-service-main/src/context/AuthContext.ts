import React, { createContext, useContext, useEffect, useState } from "react";
import { checkAuth, User } from "../services/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  return React.createElement(
    AuthContext.Provider,
    { value: { user, loading, setUser } },
    children
  );
}

export function useAuth() {
  return useContext(AuthContext);
}