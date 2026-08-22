import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as HotToaster } from "react-hot-toast";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AuthProvider } from "@/components/auth/AuthProvider";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import RideStatus from "./pages/RideStatus";
import Profile from "./pages/Profile";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import { DriverDashboard } from "./pages/DriverDashboard";
import { DriverVerificationFlow } from "./pages/DriverVerficationFlow";
import { WebSocketProvider } from "./context/WebSocketContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HotToaster
        position="top-center"
        toastOptions={{
          style: {
            background: "hsl(222 47% 11%)",
            color: "hsl(210 40% 98%)",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 500,
          },
          success: { iconTheme: { primary: "hsl(160 84% 39%)", secondary: "white" } },
          error: { iconTheme: { primary: "hsl(0 84% 60%)", secondary: "white" } },
        }}
      />
      <BrowserRouter>
        {/* AuthProvider must wrap everything that might render a ProtectedRoute.
            It calls initializeAuth() once on mount, which asks the backend
            "am I logged in?" via GET /users/me (cookie-based session check). */}
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <WebSocketProvider>
                    <Dashboard />
                  </WebSocketProvider>
                </ProtectedRoute>
              }
            />
            <Route path="/driver/profile/verify" element={<ProtectedRoute><DriverVerificationFlow /></ProtectedRoute>} />
            {/* <Route path="/ride/:id" element={<ProtectedRoute><RideStatus /></ProtectedRoute>} /> */}
            {/* <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} /> */}
            {/* <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} /> */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
