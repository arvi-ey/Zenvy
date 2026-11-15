"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract token from URL query (?token=...)
  const tokenFromQuery = searchParams.get("token") || "";

  const [token, setToken] = useState(tokenFromQuery);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (tokenFromQuery) {
      setToken(tokenFromQuery);
    }
  }, [tokenFromQuery]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!token.trim()) {
      setStatus("error");
      setMessage("Verification token is missing. Please check your email link.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      // Point to your Express backend API endpoint
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/v1/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: token.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || "Verification failed.");
      }

      setStatus("success");
      setMessage(result.message || "Email verified successfully! Welcome to Zenvy.");

      // Store the returned access & refresh tokens from your updated verifyEmail controller
      if (result.data?.accessToken) {
        localStorage.setItem("accessToken", result.data.accessToken);
        localStorage.setItem("refreshToken", result.data.refreshToken);
      }

      // Redirect into the website after 2 seconds
      setTimeout(() => {
        router.push("/"); // Change to "/dashboard" or your main landing route
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Invalid or expired verification token.");
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] rounded-[var(--radius)] shadow-sm p-8">
        
        {/* Brand & Heading */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--secondary)] text-[var(--foreground)] mb-4">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1.5">
            Click the button below to confirm your email address and activate your Zenvy account.
          </p>
        </div>

        {/* Verified Success View */}
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
        ) : (
          <form onSubmit={handleVerify} className="space-y-5">
            {/* Token Preview / Input */}
            <div>
              <label
                htmlFor="verification-token"
                className="block text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5"
              >
                Verification Token
              </label>
              <input
                id="verification-token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="No token detected in URL..."
                className="w-full px-3.5 py-2.5 rounded-[var(--radius)] border border-[var(--input)] bg-[var(--background)] text-[var(--foreground)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
              />
            </div>

            {/* Error Alert */}
            {status === "error" && (
              <div className="p-3 rounded-[var(--radius)] bg-[var(--destructive)]/10 border border-[var(--destructive)] text-[var(--destructive)] text-sm">
                {message}
              </div>
            )}

            {/* Two Primary Buttons: Cancel & Verify */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleCancel}
                disabled={status === "loading"}
                className="flex-1 px-4 py-2.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:opacity-80 font-medium text-sm transition-opacity disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={status === "loading"}
                className="flex-1 px-4 py-2.5 rounded-[var(--radius)] bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 font-medium text-sm transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {status === "loading" ? "Verifying..." : "Verify"}
              </button>
            </div>

            {/* Demo Submit / Fill Button */}
            <div className="pt-4 border-t border-[var(--border)] flex justify-center">
              <button
                type="button"
                onClick={() => {
                  const demoToken = "demo_verification_token_987654321";
                  setToken(demoToken);
                  setStatus("idle");
                  setMessage("");
                }}
                className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline underline-offset-4 transition-colors cursor-pointer"
              >
                Demo: Populate Sample Token
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