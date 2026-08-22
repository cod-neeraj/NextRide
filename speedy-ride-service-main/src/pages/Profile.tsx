import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { useAuthStore } from "@/stores/authStore";

export default function Profile() {
  // const navigate = useNavigate();
  // const { user, setUser, logout } = useAuthStore();
  // const [editing, setEditing] = useState(false);
  // const [form, setForm] = useState({ fullName: user?.fullName ?? "", phone: user?.phone ?? "" });
  // const [saving, setSaving] = useState(false);
  // const [confirmOpen, setConfirmOpen] = useState(false);
  // const [deleting, setDeleting] = useState(false);

  // if (!user) return null;

  // const save = async () => {
  //   if (form.fullName.trim().length < 2) { toast.error("Enter a valid name"); return; }
  //   if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, "").slice(-10))) {
  //     toast.error("Enter a valid 10-digit phone"); return;
  //   }
  //   setSaving(true);
  //   try {
  //     const updated = await updateProfile(user.id, form);
  //     setUser(updated);
  //   } catch {
  //     setUser({ ...user, ...form });
  //   }
  //   toast.success("Profile updated");
  //   setEditing(false);
  //   setSaving(false);
  // };

  // const handleDelete = async () => {
  //   setDeleting(true);
  //   try { await deleteAccount(user.id); } catch {}
  //   toast.success("Account deleted");
  //   logout();
  //   navigate("/");
  // };

  // return (
  //   <div className="min-h-screen bg-background">
  //     <Navbar />
  //     <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
  //       <h1 className="text-2xl font-bold text-foreground">Profile</h1>
  //       <p className="text-sm text-muted-foreground">Manage your account information.</p>

  //       <AppCard className="mt-6">
  //         <div className="flex items-center gap-4">
  //           <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
  //             {user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
  //           </div>
  //           <div>
  //             <p className="text-lg font-semibold text-foreground">{user.fullName}</p>
  //             <p className="text-sm text-muted-foreground">{user.role}</p>
  //           </div>
  //           {!editing && (
  //             <button
  //               onClick={() => setEditing(true)}
  //               className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted"
  //             >
  //               <Pencil className="h-3.5 w-3.5" /> Edit
  //             </button>
  //           )}
  //         </div>

  //         <div className="mt-6 space-y-4">
  //           {editing ? (
  //             <>
  //               <AppInput
  //                 label="Full name"
  //                 value={form.fullName}
  //                 onChange={(e) => setForm({ ...form, fullName: e.target.value })}
  //               />
  //               <AppInput
  //                 label="Phone"
  //                 value={form.phone}
  //                 onChange={(e) => setForm({ ...form, phone: e.target.value })}
  //               />
  //               <div className="flex gap-2">
  //                 <AppButton variant="primary" loading={saving} onClick={save}>Save changes</AppButton>
  //                 <AppButton variant="ghost" onClick={() => { setEditing(false); setForm({ fullName: user.fullName, phone: user.phone }); }}>
  //                   Cancel
  //                 </AppButton>
  //               </div>
  //             </>
  //           ) : (
  //             <dl className="divide-y divide-border">
  //               <div className="flex justify-between py-3">
  //                 <dt className="text-sm text-muted-foreground">Email</dt>
  //                 <dd className="text-sm font-medium text-foreground">{user.email}</dd>
  //               </div>
  //               <div className="flex justify-between py-3">
  //                 <dt className="text-sm text-muted-foreground">Phone</dt>
  //                 <dd className="text-sm font-medium text-foreground">{user.phone}</dd>
  //               </div>
  //               <div className="flex justify-between py-3">
  //                 <dt className="text-sm text-muted-foreground">Role</dt>
  //                 <dd className="text-sm font-medium text-foreground">{user.role}</dd>
  //               </div>
  //             </dl>
  //           )}
  //         </div>
  //       </AppCard>

  //       <AppCard className="mt-6 border-destructive/30">
  //         <h3 className="text-base font-semibold text-foreground">Danger zone</h3>
  //         <p className="mt-1 text-sm text-muted-foreground">
  //           Deleting your account is permanent and cannot be undone.
  //         </p>
  //         <AppButton variant="danger" className="mt-4" onClick={() => setConfirmOpen(true)}>
  //           <Trash2 className="h-4 w-4" /> Delete account
  //         </AppButton>
  //       </AppCard>
  //     </main>

  //     <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
  //       <DialogContent>
  //         <DialogHeader>
  //           <DialogTitle>Delete your account?</DialogTitle>
  //           <DialogDescription>
  //             This will permanently remove your SwiftRide account and all ride history. This action cannot be undone.
  //           </DialogDescription>
  //         </DialogHeader>
  //         <DialogFooter>
  //           <AppButton variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</AppButton>
  //           <AppButton variant="danger" loading={deleting} onClick={handleDelete}>Yes, delete</AppButton>
  //         </DialogFooter>
  //       </DialogContent>
  //     </Dialog>
  //   </div>
  // );
}
