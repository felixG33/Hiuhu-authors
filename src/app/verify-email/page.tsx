"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/branding/Logo";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    async function verify() {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Your email has been verified successfully.");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed. The token may be expired or invalid.");
        }
      } catch {
        setStatus("error");
        setMessage("An error occurred during verification.");
      }
    }

    verify();
  }, [token]);

  return (
    <div className="w-full max-w-md space-y-6 p-8 sm:p-10 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-md text-center">
      <Logo size="md" showTagline={false} href="/" className="justify-center" />
      <h2 className="font-serif text-2xl font-bold">Email Verification</h2>

      {status === "loading" && (
        <div className="flex flex-col items-center gap-2 py-4">
          <Loader2 className="h-6 w-6 animate-spin text-amber-700" />
          <p className="font-serif text-ink-600 dark:text-parchment-300">
            Verifying your reader/author account token...
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-4 py-4">
          <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
          <p className="font-serif text-ink-700 dark:text-parchment-300">{message}</p>
          <Link href="/login">
            <Button variant="gold" size="md">
              Proceed to Login
            </Button>
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-4 py-4">
          <AlertCircle className="h-10 w-10 text-crimson-600 mx-auto" />
          <p className="font-serif text-crimson-700 dark:text-crimson-300">{message}</p>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Return to Login
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-parchment-100/60 dark:bg-ink-950">
      <Suspense
        fallback={
          <div className="flex items-center gap-2 font-serif text-sm text-ink-500">
            <Loader2 className="h-4 w-4 animate-spin text-amber-700" />
            <span>Verifying literary account...</span>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
