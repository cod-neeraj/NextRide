import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Logo } from "@/components/ui/Logo";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { useAuthStore } from "@/stores/authStore";
import { resolveRedirectPath } from "@/lib/authRouting";
import { userApi } from "@/services/instances"; // <-- use the userApi instance here

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
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
      console.log("Submitting login form:", form);
      const res = await userApi.post("/auth/login", form);
      console.log("Login response:", res.data);
      const user = res.data.data;
      setAuth(user);

      navigate("/dashboard");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Invalid phone number or password";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
        <Link to="/"><Logo/></Link>
        <Link to="/register" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Don't have an account? <span className="text-accent">Sign up</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-elevated)]">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to continue your ride.</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <AppInput
                label="Mobile Number"
                type="tel"
                name="phone"
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
                autoComplete="current-password"
              />
              <AppButton type="submit" loading={loading} fullWidth size="lg">
                Sign in
              </AppButton>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
