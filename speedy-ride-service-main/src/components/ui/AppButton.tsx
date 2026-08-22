import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "success" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

export interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  secondary: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm",
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
  success: "bg-success text-success-foreground hover:bg-success/90 shadow-sm",
  ghost: "bg-transparent hover:bg-muted text-foreground",
  outline: "border border-border bg-card hover:bg-muted text-foreground",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ className, variant = "primary", size = "md", loading, fullWidth, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  ),
);
AppButton.displayName = "AppButton";
