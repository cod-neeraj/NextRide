import { Link } from "react-router-dom";
import { ArrowRight, Clock, ShieldCheck, Wallet } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { AppButton } from "@/components/ui/AppButton";

export default function Landing() {
  console.log("🔥 LANDING RENDERED");
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2">
          <Link to="/login">
            <AppButton variant="ghost" size="sm">Login</AppButton>
          </Link>
          <Link to="/register">
            <AppButton variant="primary" size="sm">Register</AppButton>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 sm:pt-20 lg:pt-28">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> Now live in Chandigarh
              </span>
              <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Your ride,<br />
                <span className="text-accent">in seconds.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
                Premium cabs at your doorstep. Transparent fares, trusted drivers, and the smoothest booking experience you've ever had.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link to="/register">
                  <AppButton variant="primary" size="lg" className="min-w-[180px]">
                    Get started <ArrowRight className="h-4 w-4" />
                  </AppButton>
                </Link>
                <Link to="/login">
                  <AppButton variant="outline" size="lg" className="min-w-[180px]">
                    I already have an account
                  </AppButton>
                </Link>
              </div>
            </div>

            {/* Feature tiles */}
            <div className="mx-auto mt-20 grid max-w-5xl gap-4 sm:grid-cols-3">
              {[
                { icon: Clock, title: "Pickup in 3 mins", desc: "Drivers nearby — no waiting around." },
                { icon: Wallet, title: "Transparent pricing", desc: "Know your fare before you book. Always." },
                { icon: ShieldCheck, title: "Verified drivers", desc: "Background-checked and rated by riders." },
              ].map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} SwiftRide. All rights reserved.</p>
          <p>Made with care in India 🇮🇳</p>
        </div>
      </footer>
    </div>
  );
}
