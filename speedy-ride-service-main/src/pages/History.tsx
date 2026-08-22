import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AppCard } from "@/components/ui/AppCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Spinner } from "@/components/ui/Spinner";
// import { listRides } from "@/services/api";
import { formatINR, formatDate } from "@/lib/format";
import { DUMMY_RIDES } from "@/lib/dummyData";
import type { Ride } from "@/types";

export default function History() {
  // const [rides, setRides] = useState<Ride[] | null>(null);

  // useEffect(() => {
  //   listRides()
  //     .then(setRides)
  //     .catch(() => setRides(DUMMY_RIDES));
  // }, []);

  // return (
  //   <div className="min-h-screen bg-background">
  //     <Navbar />
  //     <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
  //       <h1 className="text-2xl font-bold text-foreground">Ride history</h1>
  //       <p className="text-sm text-muted-foreground">All your past rides in one place.</p>

  //       {rides === null ? (
  //         <div className="mt-10 flex justify-center"><Spinner className="h-6 w-6" /></div>
  //       ) : rides.length === 0 ? (
  //         <AppCard className="mt-6 text-center">
  //           <p className="text-sm text-muted-foreground">No rides yet.</p>
  //         </AppCard>
  //       ) : (
  //         <>
  //           {/* Mobile cards */}
  //           <div className="mt-6 grid gap-3 md:hidden">
  //             {rides.map((r) => (
  //               <AppCard key={r.id} className="!p-4">
  //                 <div className="flex items-center justify-between">
  //                   <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
  //                   <StatusBadge status={r.status} />
  //                 </div>
  //                 <p className="mt-2 text-sm font-medium text-foreground">{r.pickup} → {r.dropoff}</p>
  //                 <p className="mt-1 text-base font-bold text-foreground">{formatINR(r.fare)}</p>
  //               </AppCard>
  //             ))}
  //           </div>

  //           {/* Desktop table */}
  //           <AppCard className="mt-6 hidden !p-0 md:block">
  //             <table className="w-full text-sm">
  //               <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
  //                 <tr>
  //                   <th className="px-4 py-3 text-left">Date</th>
  //                   <th className="px-4 py-3 text-left">Pickup</th>
  //                   <th className="px-4 py-3 text-left">Drop-off</th>
  //                   <th className="px-4 py-3 text-right">Fare</th>
  //                   <th className="px-4 py-3 text-right">Status</th>
  //                 </tr>
  //               </thead>
  //               <tbody className="divide-y divide-border">
  //                 {rides.map((r) => (
  //                   <tr key={r.id} className="hover:bg-muted/30">
  //                     <td className="px-4 py-3 text-muted-foreground">{formatDate(r.createdAt)}</td>
  //                     <td className="px-4 py-3 font-medium text-foreground">{r.pickup}</td>
  //                     <td className="px-4 py-3 font-medium text-foreground">{r.dropoff}</td>
  //                     <td className="px-4 py-3 text-right font-bold text-foreground">{formatINR(r.fare)}</td>
  //                     <td className="px-4 py-3 text-right"><StatusBadge status={r.status} /></td>
  //                   </tr>
  //                 ))}
  //               </tbody>
  //             </table>
  //           </AppCard>
  //         </>
  //       )}
  //     </main>
  //   </div>
  // );
}
