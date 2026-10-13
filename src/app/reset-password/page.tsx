"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Logo } from "@/components/branding/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Loader2 } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { success } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg("Missing reset token");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg("");
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      success("Password reset successfully", "You can now log in with your new password");
      router.push("/login");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 p-8 sm:p-10 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-md">
      <div className="text-center space-y-3">
        <Logo size="md" showTagline={false} href="/" className="justify-center" />
        <h2 className="font-serif text-2xl font-bold">Set New Password</h2>
        <p className="text-xs text-ink-500 font-mono">
          Enter and confirm your new secure password
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs bg-crimson-50 text-crimson-700 border border-crimson-200 rounded-sm font-mono">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-4">
        <Input
          label="New Password"
          type="password"
          required
          placeholder="Minimum 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Input
          label="Confirm New Password"
          type="password"
          required
          placeholder="Repeat new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button type="submit" variant="gold" size="lg" isLoading={isLoading} className="w-full">
          Update Password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-parchment-100/60 dark:bg-ink-950">
      <Suspense
        fallback={
          <div className="flex items-center gap-2 font-serif text-sm text-ink-500">
            <Loader2 className="h-4 w-4 animate-spin text-amber-700" />
            <span>Loading password reset folio...</span>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
