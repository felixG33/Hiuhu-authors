"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/branding/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      setErrorMsg("");
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        throw new Error("Failed to process request");
      }
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to process request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-parchment-100/60 dark:bg-ink-950">
      <div className="w-full max-w-md space-y-6 p-8 sm:p-10 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-md">
        <div className="text-center space-y-3">
          <Logo size="md" showTagline={false} href="/" className="justify-center" />
          <h2 className="font-serif text-2xl font-bold">Password Recovery</h2>
          <p className="text-xs text-ink-500 font-mono">
            Enter your account email to receive reset instructions
          </p>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-sm">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto" />
            <p className="font-serif text-sm text-emerald-900 dark:text-emerald-100">
              If an account is associated with {email}, password reset instructions have been dispatched.
            </p>
            <Link href="/login" className="text-xs font-mono font-bold text-emerald-800 block pt-2 underline">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && <p className="text-xs text-crimson-600">{errorMsg}</p>}
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="author@hiuhu.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" variant="gold" size="lg" isLoading={isLoading} className="w-full">
              Send Reset Link
            </Button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link href="/login" className="text-xs font-mono text-ink-500 hover:text-ink-900 flex items-center justify-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
