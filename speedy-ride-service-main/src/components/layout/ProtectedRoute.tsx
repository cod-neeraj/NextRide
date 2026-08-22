import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-accent" />

        <p className="text-sm text-muted-foreground">
          Restoring your session…
        </p>
      </div>
    </div>
  );
}

export function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAuthStore(
    (s) => s.isAuthenticated
  );

  const isLoading = useAuthStore(
    (s) => s.isLoading
  );

  const location = useLocation();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <>{children}</>;
}