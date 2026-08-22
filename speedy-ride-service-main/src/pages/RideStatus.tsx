import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Phone, Star, Car, Check } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
// import { getRide, cancelRide } from "@/services/api";
import { useRideStore } from "@/stores/rideStore";
import { formatINR } from "@/lib/format";
import { DUMMY_ACTIVE_RIDE } from "@/lib/dummyData";
import { cn } from "@/lib/utils";
import type { Ride, RideStatus } from "@/types";

const STEPS: { key: RideStatus; label: string }[] = [
  { key: "REQUESTED", label: "Requested" },
  { key: "DRIVER_ASSIGNED", label: "Driver Assigned" },
  { key: "DRIVER_ARRIVED", label: "Driver Arrived" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "COMPLETED", label: "Completed" },
];

export default function RideStatus() {
  // const { id } = useParams();
  // const navigate = useNavigate();
  // const { activeRide, setActiveRide, clearRide } = useRideStore();
  // const [ride, setRide] = useState<Ride | null>(activeRide ?? DUMMY_ACTIVE_RIDE);
  // const [cancelling, setCancelling] = useState(false);

  // useEffect(() => {
  //   let mounted = true;
  //   const fetchRide = async () => {
  //     if (!id) return;
  //     try {
  //       const data = await getRide(id);
  //       if (mounted) {
  //         setRide(data);
  //         setActiveRide(data);
  //       }
  //     } catch {
  //       // Keep current ride / dummy
  //     }
  //   };
  //   fetchRide();
  //   const t = setInterval(fetchRide, 5000);
  //   return () => {
  //     mounted = false;
  //     clearInterval(t);
  //   };
  // }, [id, setActiveRide]);

  // if (!ride) {
  //   return (
  //     <div className="min-h-screen bg-background">
  //       <Navbar />
  //       <main className="mx-auto max-w-3xl px-4 py-12 text-center">
  //         <p className="text-muted-foreground">No active ride.</p>
  //       </main>
  //     </div>
  //   );
  // }

  // const currentIdx = STEPS.findIndex((s) => s.key === ride.status);
  // const canCancel = ride.status === "REQUESTED" || ride.status === "DRIVER_ASSIGNED";

  // const handleCancel = async () => {
  //   setCancelling(true);
  //   try {
  //     await cancelRide(ride.id);
  //     toast.success("Ride cancelled");
  //   } catch {
  //     toast.success("Ride cancelled (demo)");
  //   } finally {
  //     clearRide();
  //     setCancelling(false);
  //     navigate("/dashboard");
  //   }
  // };

  // const driver = ride.driver ?? DUMMY_ACTIVE_RIDE.driver!;

  // return (
  //   <div className="min-h-screen bg-background">
  //     <Navbar />
  //     <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
  //       <div className="mb-6">
  //         <h1 className="text-2xl font-bold text-foreground">Ride #{ride.id.slice(-6).toUpperCase()}</h1>
  //         <p className="text-sm text-muted-foreground">{ride.pickup} → {ride.dropoff}</p>
  //       </div>

  //       {/* Stepper */}
  //       <AppCard>
  //         <ol className="flex items-start justify-between">
  //           {STEPS.map((step, idx) => {
  //             const done = idx < currentIdx;
  //             const active = idx === currentIdx;
  //             return (
  //               <li key={step.key} className="flex flex-1 flex-col items-center">
  //                 <div className="relative flex w-full items-center justify-center">
  //                   {idx > 0 && (
  //                     <div
  //                       className={cn(
  //                         "absolute left-0 right-1/2 top-1/2 h-0.5 -translate-y-1/2",
  //                         done || active ? "bg-accent" : "bg-border",
  //                       )}
  //                     />
  //                   )}
  //                   {idx < STEPS.length - 1 && (
  //                     <div
  //                       className={cn(
  //                         "absolute left-1/2 right-0 top-1/2 h-0.5 -translate-y-1/2",
  //                         done ? "bg-accent" : "bg-border",
  //                       )}
  //                     />
  //                   )}
  //                   <div
  //                     className={cn(
  //                       "relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
  //                       done && "border-accent bg-accent text-accent-foreground",
  //                       active && "border-accent bg-accent text-accent-foreground ring-4 ring-accent/20",
  //                       !done && !active && "border-border bg-card text-muted-foreground",
  //                     )}
  //                   >
  //                     {done ? <Check className="h-4 w-4" /> : idx + 1}
  //                   </div>
  //                 </div>
  //                 <p
  //                   className={cn(
  //                     "mt-2 text-center text-[11px] font-medium leading-tight sm:text-xs",
  //                     active ? "text-accent" : done ? "text-foreground" : "text-muted-foreground",
  //                   )}
  //                 >
  //                   {step.label}
  //                 </p>
  //               </li>
  //             );
  //           })}
  //         </ol>
  //       </AppCard>

  //       <div className="mt-6 grid gap-6 md:grid-cols-2">
  //         {/* Driver card */}
  //         <AppCard>
  //           <h3 className="text-base font-semibold text-foreground">Your driver</h3>
  //           <div className="mt-4 flex items-center gap-4">
  //             <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
  //               {driver.name.split(" ").map((n) => n[0]).join("")}
  //             </div>
  //             <div className="flex-1">
  //               <p className="text-base font-semibold text-foreground">{driver.name}</p>
  //               <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
  //                 <Star className="h-3 w-3 fill-warning text-warning" /> {driver.rating}
  //               </p>
  //             </div>
  //             <a
  //               href={`tel:${driver.phone}`}
  //               className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-success-foreground hover:bg-success/90"
  //               aria-label="Call driver"
  //             >
  //               <Phone className="h-4 w-4" />
  //             </a>
  //           </div>
  //           <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/60 p-3 text-sm">
  //             <Car className="h-4 w-4 text-muted-foreground" />
  //             <span className="font-medium text-foreground">{driver.vehicle}</span>
  //             <span className="ml-auto rounded bg-card px-2 py-0.5 font-mono text-xs font-bold text-foreground border border-border">
  //               {driver.plate}
  //             </span>
  //           </div>
  //         </AppCard>

  //         {/* Fare card */}
  //         <AppCard>
  //           <h3 className="text-base font-semibold text-foreground">Fare</h3>
  //           <dl className="mt-4 space-y-2 text-sm">
  //             <div className="flex justify-between">
  //               <dt className="text-muted-foreground">Base fare</dt>
  //               <dd className="text-foreground">{formatINR(50)}</dd>
  //             </div>
  //             <div className="flex justify-between">
  //               <dt className="text-muted-foreground">Distance & time</dt>
  //               <dd className="text-foreground">{formatINR(ride.fare - 50)}</dd>
  //             </div>
  //             <div className="my-2 border-t border-border" />
  //             <div className="flex justify-between text-base">
  //               <dt className="font-semibold text-foreground">Total</dt>
  //               <dd className="font-bold text-accent">{formatINR(ride.fare)}</dd>
  //             </div>
  //           </dl>
  //         </AppCard>
  //       </div>

  //       {canCancel && (
  //         <div className="mt-6 flex justify-end">
  //           <AppButton variant="danger" loading={cancelling} onClick={handleCancel}>
  //             Cancel ride
  //           </AppButton>
  //         </div>
  //       )}
  //     </main>
  //   </div>
  // );
}
