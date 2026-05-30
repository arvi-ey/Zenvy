import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countryCodes } from "@/constants";

import { Check, X } from "lucide-react";
import { toast } from "sonner";


export default function SignUp() {
    const [form, setForm] = useState({
        firstName: "", lastName: "", email: "", phone: "", countryCode: "+91", password: "", confirm: "",
    })


    const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
    const rules = {
        length: form.password.length >= 8,
        upper: /[A-Z]/.test(form.password),
        number: /[0-9]/.test(form.password),
        match: !!form.password && form.password === form.confirm,
    };

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.firstName || !form.lastName) return toast.error("Please enter your full name.");
        if (!form.email.includes("@")) return toast.error("Enter a valid email.");
        if (!Object.values(rules).every(Boolean)) return toast.error("Password requirements not met.");


    }

    return (
        <div className="w-full min-h-screen flex justify-center items-center bg-background ">
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <Field label="First name"><Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Alex" className="h-11" required /></Field>
                    <Field label="Last name"><Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Hayes" className="h-11" required /></Field>
                </div>
                <Field label="Work email"><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="alex@company.com" className="h-11" required /></Field>
                <div className="space-y-1.5">
                    <Label>Phone number</Label>
                    <div className="flex items-center gap-2">
                        <Select value={form.countryCode} onValueChange={(v) => set("countryCode", v)}>
                            <SelectTrigger className="h-11 w-[140px] bg-card border border-foreground text-foreground"><SelectValue /></SelectTrigger>
                            <SelectContent className="max-h-72">
                                {countryCodes.map((c) => (
                                    <SelectItem key={`${c.country}-${c.code}`} value={c.code}>{c.flag} {c.code} {c.country}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="555 0124 998" className="h-11 flex-1" />
                    </div>
                </div>
                <Field label="Password"><Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} className="h-11" required /></Field>
                <Field label="Confirm password"><Input type="password" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} className="h-11" required /></Field>

                <ul className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                    <Rule ok={rules.length}>At least 8 characters</Rule>
                    <Rule ok={rules.upper}>One uppercase letter</Rule>
                    <Rule ok={rules.number}>One number</Rule>
                    <Rule ok={rules.match}>Passwords match</Rule>
                </ul>

                <button className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold press lift shadow-glow cursor-pointer">Create account</button>
                <p className="text-xs text-center text-muted-foreground">By signing up you agree to our Terms & Privacy.</p>
                <div className="w-full max-w-md ">
                    <div className="anim-fade-in-up">
                        <div className="mt-6 text-sm text-center text-muted-foreground">
                            <>Already have an account? <Link to="/sign-in" className="text-primary font-medium hover:underline">Sign in</Link></>
                        </div>
                    </div>
                    <p className="mt-10 text-xs text-center text-muted-foreground">
                        <Link to="/" className="hover:text-foreground">← Back to home</Link>
                    </p>
                </div>
            </form >
        </div >
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
    return <li className={`flex items-center gap-1 ${ok ? "text-success" : ""}`}>{ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 opacity-60" />} {children}</li>;
}
