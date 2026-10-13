"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/branding/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Lock, Mail, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { success } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      success("Signed in successfully", `Welcome back, ${data.user.name}`);

      // Redirect depending on role
      if (data.user.role === "READER") {
        router.push("/");
      } else {
        router.push("/admin");
      }
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials provided");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-parchment-100/60 dark:bg-ink-950">
      <div className="w-full max-w-md space-y-8 p-8 sm:p-10 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-md">
        {/* Header */}
        <div className="text-center space-y-3">
          <Logo size="lg" showTagline={false} href="/" className="justify-center" />
          <h2 className="font-serif text-2xl font-bold pt-2">Sign in to HIUHU</h2>
          <p className="text-xs text-ink-500 font-mono">
            Enter your credentials to access the editorial CMS or reader account
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 text-xs rounded-sm bg-crimson-50 dark:bg-crimson-950/40 border border-crimson-200 dark:border-crimson-800 text-crimson-700 dark:text-crimson-200 text-center font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="admin@hiuhu.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-[11px] font-mono text-ink-500 hover:text-amber-800 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button type="submit" variant="gold" size="lg" isLoading={isLoading} className="w-full mt-2">
            Sign In
          </Button>
        </form>

        <div className="border-t border-parchment-200 dark:border-ink-800 pt-6 text-center text-xs text-ink-600 dark:text-parchment-400 font-serif">
          Don&rsquo;t have an author or reader account yet?{" "}
          <Link href="/register" className="text-amber-800 dark:text-amber-400 font-bold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
