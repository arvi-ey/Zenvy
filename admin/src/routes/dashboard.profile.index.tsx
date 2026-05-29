import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { updateProfile } from "@/redux/slices/profileSlice";
import { setBusinessName } from "@/redux/slices/settingsSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countryCodes } from "@/constants";
import { Camera, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/profile/")({
  head: () => ({ meta: [{ title: "Profile — Northstar" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const profile = useAppSelector((s) => s.profile);
  const businessName = useAppSelector((s) => s.settings.businessName);
  const dispatch = useAppDispatch();
  const [form, setForm] = useState(profile);
  const [biz, setBiz] = useState(businessName);
  const fileRef = useRef<HTMLInputElement>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, avatar: reader.result as string });
    reader.readAsDataURL(f);
  }

  function save() {
    dispatch(updateProfile(form));
    dispatch(setBusinessName(biz));
    toast.success("Profile updated");
  }

  return (
    <div>
      <PageHeader title="Profile" description="Update your personal and business information." actions={
        <button onClick={save} className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold press lift shadow-glow"><Save className="h-4 w-4" /> Save changes</button>
      } />

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft text-center">
          <div className="relative inline-block">
            <Avatar className="h-24 w-24 ring-4 ring-primary/20">
              {form.avatar && <AvatarImage src={form.avatar} />}
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl font-semibold">{form.firstName[0]}{form.lastName[0]}</AvatarFallback>
            </Avatar>
            <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center shadow-glow press">
              <Camera className="h-4 w-4" />
            </button>
            <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={onPick} />
          </div>
          <h3 className="mt-4 font-semibold text-lg">{form.firstName} {form.lastName}</h3>
          <p className="text-sm text-muted-foreground">{form.jobTitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">{biz}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
          <h3 className="font-semibold mb-4">Personal information</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="First name"><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></Field>
            <Field label="Last name"><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></Field>
            <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Job title"><Input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} /></Field>
            <div className="sm:col-span-2">
              <Label>Phone</Label>
              <div className="flex gap-2 mt-1.5">
                <Select value={form.countryCode} onValueChange={(v) => setForm({ ...form, countryCode: v })}>
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-72">{countryCodes.map((c) => <SelectItem key={`${c.country}-${c.code}`} value={c.code}>{c.flag} {c.code}</SelectItem>)}</SelectContent>
                </Select>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="flex-1" />
              </div>
            </div>
          </div>

          <h3 className="font-semibold mt-8 mb-4">Business</h3>
          <Field label="Business name"><Input value={biz} onChange={(e) => setBiz(e.target.value)} /></Field>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
