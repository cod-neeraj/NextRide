import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, User as UserIcon, Clock } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useAuthStore } from "@/stores/authStore";
// import { authService } from "@/services/authService";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // await authService.logout();
    } catch {
      // Clear local session even if backend logout fails
    }
    logout();
    toast.success("Logged out");
    navigate("/login", { replace: true });
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
      isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
    );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/dashboard" aria-label="SwiftRide home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/history" className={linkClass}>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> History
            </span>
          </NavLink>
          <NavLink to="/profile" className={linkClass}>
            <span className="inline-flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5" /> Profile
            </span>
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-foreground leading-tight">{user.fullName}</p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
