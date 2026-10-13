"use client";

import React, { useState } from "react";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Mail, CheckCircle2, Send, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { error: toastError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit inquiry");
      }

      setSubmitted(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      toastError(err.message || "An error occurred while sending your message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-ink-950 dark:text-parchment-50">
      <Header />

      <main className="flex-1 py-16 md:py-24">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 space-y-12">
          {/* Header */}
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-semibold">
              Correspondence & Inquiries
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold">Contact HIUHU</h1>
            <p className="font-serif text-base text-ink-600 dark:text-parchment-300 leading-relaxed">
              For literary engagements, translation rights, or personal correspondence with the author.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* Form */}
            <div className="md:col-span-8 p-8 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900/60 shadow-xs">
              {submitted ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold">Message Dispatched</h3>
                  <p className="font-serif text-sm text-ink-600 dark:text-parchment-300 max-w-md mx-auto leading-relaxed">
                    Your correspondence has been forwarded to the editorial desk. We appreciate your interest in HIUHU and will reply if appropriate.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                    Send Another Dispatch
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Your Full Name"
                      required
                      placeholder="e.g. Samuel Bennett"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      required
                      placeholder="samuel@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <Input
                    label="Subject / Nature of Inquiry"
                    required
                    placeholder="Editorial Submission, Book Query, or Press"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />

                  <Textarea
                    label="Message"
                    required
                    rows={6}
                    placeholder="Write your correspondence here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] font-mono text-ink-400">
                      Rate-limited & protected against spam.
                    </span>
                    <Button type="submit" variant="gold" size="lg" isLoading={isSubmitting} className="gap-2">
                      <Send className="h-4 w-4" />
                      Send Dispatch
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Sidebar Details */}
            <div className="md:col-span-4 space-y-6">
              <div className="p-6 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900/40 space-y-3">
                <h4 className="font-serif text-lg font-bold">Editorial Offices</h4>
                <div className="flex items-start gap-2.5 text-xs font-mono text-ink-600 dark:text-parchment-400 leading-relaxed">
                  <MapPin className="h-4 w-4 shrink-0 text-amber-800 mt-0.5" />
                  <span>
                    HIUHU Press Publishing Sanctuary
                    <br />
                    Edinburgh • New York • Paris
                  </span>
                </div>
              </div>

              <div className="p-6 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900/40 space-y-3">
                <h4 className="font-serif text-lg font-bold">Submissions Notice</h4>
                <p className="font-serif text-xs text-ink-600 dark:text-parchment-400 leading-relaxed">
                  We review manuscripts, poetry chapbooks, and long-form essays on a rolling basis. Authors may register on the platform for draft uploads.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
