"use client";

import React, { useEffect, useState, Suspense, type FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { resendVerificationEmail, verifyEmail } from "@/api/auth";
import { useAppDispatch } from "@/store/hooks";
import { setAuthenticated } from "@/store/slices/authSlice";

type VerificationStatus = "idle" | "loading" | "success" | "error" | "expired" | "resending" | "resent";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const tokenFromQuery = searchParams.get("token") || "";

  const [token, setToken] = useState(tokenFromQuery);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<VerificationStatus>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setToken(tokenFromQuery);
  }, [tokenFromQuery]);

  useEffect(() => {
    if (status !== "success") return;

    const timeout = window.setTimeout(() => {
      router.replace("/");
      router.refresh();
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [router, status]);

  const handleVerify = async (event?: FormEvent) => {
    event?.preventDefault();

    if (!token.trim()) {
      setStatus("error");
      setMessage("Verification token is missing. Please check your email link.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const result = await verifyEmail(token.trim());
      dispatch(setAuthenticated({
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.first_name,
          lastName: result.user.last_name,
          phone: result.user.phone,
        },
        accessToken: result.accessToken,
      }));
      setStatus("success");
      setMessage("Email verified successfully! Welcome to Zenvy.");
    } catch (error: unknown) {
      const expired = axios.isAxiosError(error) && error.response?.status === 410;
      const errorMessage = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message ?? "Unable to verify your email. Please try again."
        : error instanceof Error
          ? error.message
          : "Unable to verify your email. Please try again.";
      setStatus(expired ? "expired" : "error");
      setMessage(errorMessage);
    }
  };

  const handleResend = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("resending");
    setMessage("");

    try {
      const responseMessage = await resendVerificationEmail(email.trim());
      setStatus("resent");
      setMessage(responseMessage);
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message ?? "Unable to request a new verification link. Please try again."
        : error instanceof Error
          ? error.message
          : "Unable to request a new verification link. Please try again.";
      setStatus("expired");
      setMessage(errorMessage);
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] rounded-[var(--radius)] shadow-sm p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--secondary)] text-[var(--foreground)] mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1.5">
            Confirm your email address to activate your Zenvy account.
          </p>
        </div>

        {status === "success" ? (
          <div className="bg-[var(--secondary)] border border-[var(--border)] rounded-[var(--radius)] p-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[var(--success)]/15 text-[var(--success)] flex items-center justify-center mx-auto font-bold text-lg">
              ✓
            </div>
            <h2 className="font-semibold text-base">Account Verified</h2>
            <p className="text-sm text-[var(--muted-foreground)]">{message}</p>
            <p className="text-xs text-[var(--muted-foreground)] pt-2 animate-pulse">
              Signing you in...
            </p>
          </div>
        ) : status === "resent" ? (
          <div className="space-y-5">
            <p role="status" className="p-3 rounded-[var(--radius)] bg-[var(--secondary)] border border-[var(--border)] text-sm">
              {message}
            </p>
            <button
              type="button"
              onClick={handleCancel}
              className="w-full px-4 py-2.5 rounded-[var(--radius)] bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 font-medium text-sm transition-opacity cursor-pointer"
            >
              Return home
            </button>
          </div>
        ) : status === "expired" || status === "resending" ? (
          <form onSubmit={handleResend} className="space-y-5">
            <div role="alert" className="p-3 rounded-[var(--radius)] bg-[var(--destructive)]/10 border border-[var(--destructive)] text-[var(--destructive)] text-sm">
              {message || "Your verification link has expired. Request a new one below."}
            </div>
            <div>
              <label htmlFor="verification-email" className="block text-sm font-medium mb-1.5">
                Email address
              </label>
              <input
                id="verification-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[var(--radius)] border border-[var(--input)] bg-[var(--background)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={status === "resending"}
                className="flex-1 px-4 py-2.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:opacity-80 font-medium text-sm disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === "resending"}
                className="flex-1 px-4 py-2.5 rounded-[var(--radius)] bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 font-medium text-sm disabled:opacity-50 cursor-pointer"
              >
                {status === "resending" ? "Requesting..." : "Request new link"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-5">
            {status === "error" && (
              <div role="alert" className="p-3 rounded-[var(--radius)] bg-[var(--destructive)]/10 border border-[var(--destructive)] text-[var(--destructive)] text-sm">
                {message}
              </div>
            )}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleCancel}
                disabled={status === "loading"}
                className="flex-1 px-4 py-2.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:opacity-80 font-medium text-sm disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === "loading"}
                className="flex-1 px-4 py-2.5 rounded-[var(--radius)] bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 font-medium text-sm disabled:opacity-50 cursor-pointer"
              >
                {status === "loading" ? "Verifying..." : "Verify"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center">
          <p className="text-sm text-[var(--muted-foreground)]">Loading verification...</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
