import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Logo } from "@/components/ui/Logo";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { userApi } from "@/services/instances";
import type { Role } from "@/types";
import { cn } from "@/lib/utils";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("RIDER");
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.fullName.trim().length < 2) e.fullName = "Enter your full name";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Enter a valid 10-digit Indian mobile number";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      await userApi.post("/auth/register", { ...form, role });
      toast.success("Account created successfully!");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
        <Link to="/"><Logo /></Link>
        <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Have an account? <span className="text-accent">Sign in</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-elevated)]">
            <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Choose how you'll use SwiftRide.</p>

            <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
              {(["RIDER", "DRIVER"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "rounded-md py-2 text-sm font-semibold transition-all",
                    role === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <AppInput
                label="Full name"
                name="fullName"
                placeholder="Arjun Sharma"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                error={errors.fullName}
                autoComplete="name"
              />
              <AppInput
                label="Email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
                autoComplete="email"
              />
              <AppInput
                label="Phone (10 digits)"
                name="phone"
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                error={errors.phone}
                autoComplete="tel"
              />
              <AppInput
                label="Password"
                type="password"
                name="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
                autoComplete="new-password"
              />
              <AppButton type="submit" loading={loading} fullWidth size="lg">
                Create {role.toLowerCase()} account
              </AppButton>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
