import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: string[];
  currentStep: number; // 0-indexed
  completedSteps?: boolean[]; // same length as steps
  className?: string;
}

export function Stepper({ steps, currentStep, completedSteps = [], className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <ol className="flex items-center">
        {steps.map((label, index) => {
          const isCompleted = completedSteps[index] ?? index < currentStep;
          const isActive = index === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <li key={label} className={cn("flex items-center", !isLast && "flex-1")}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    isCompleted &&
                      "border-success bg-success text-success-foreground",
                    isActive &&
                      !isCompleted &&
                      "border-primary bg-primary text-primary-foreground",
                    !isActive &&
                      !isCompleted &&
                      "border-border bg-background text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:block",
                    isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </div>

              {!isLast && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 rounded-full transition-colors sm:mx-3",
                    isCompleted ? "bg-success" : "bg-border"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile-only current step label (since text labels are hidden below sm) */}
      <p className="mt-3 text-sm font-medium text-foreground sm:hidden">
        Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
      </p>
    </div>
  );
}