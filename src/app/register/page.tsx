"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/branding/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { success } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      success("Account created successfully", "Welcome to HIUHU Press");
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-parchment-100/60 dark:bg-ink-950">
      <div className="w-full max-w-md space-y-8 p-8 sm:p-10 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-md">
        <div className="text-center space-y-3">
          <Logo size="lg" showTagline={false} href="/" className="justify-center" />
          <h2 className="font-serif text-2xl font-bold pt-2">Join HIUHU Press</h2>
          <p className="text-xs text-ink-500 font-mono">
            Create an account to read, bookmark, critique, or submit manuscripts
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 text-xs rounded-sm bg-crimson-50 dark:bg-crimson-950/40 border border-crimson-200 dark:border-crimson-800 text-crimson-700 dark:text-crimson-200 text-center font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label="Full Name"
            required
            placeholder="Jane Eyre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Email Address"
            type="email"
            required
            placeholder="jane@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            required
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Input
            label="Confirm Password"
            type="password"
            required
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button type="submit" variant="gold" size="lg" isLoading={isLoading} className="w-full mt-2">
            Create Account
          </Button>
        </form>

        <div className="border-t border-parchment-200 dark:border-ink-800 pt-6 text-center text-xs text-ink-600 dark:text-parchment-400 font-serif">
          Already registered?{" "}
          <Link href="/login" className="text-amber-800 dark:text-amber-400 font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
