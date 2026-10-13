import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Terms of Service",
  description: "Terms and conditions of publishing and reading on HIUHU Press.",
  canonicalUrl: "/terms",
});

export default async function TermsPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen flex flex-col text-ink-950 dark:text-parchment-50">
      <Header user={user} />

      <main className="flex-1 py-16">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 space-y-8">
          <h1 className="font-serif text-4xl font-bold">Terms of Service</h1>
          <p className="text-xs font-mono text-ink-500">Effective Date: October 2026</p>

          <div className="editorial-prose space-y-6 text-base leading-relaxed font-serif text-ink-800 dark:text-parchment-200">
            <p>
              Welcome to HIUHU. By accessing our platform as a reader or author, you agree to abide by these terms.
            </p>
            <h2 className="text-2xl font-bold pt-4">1. Community & Editorial Standards</h2>
            <p>
              HIUHU maintains editorial curation. Content submitted by authors is reviewed for quality, formatting, and originality before publication. We do not permit plagiarism, hate speech, or automated spam.
            </p>
            <h2 className="text-2xl font-bold pt-4">2. Reader Conduct & Comments</h2>
            <p>
              Readers may post reflections and commentary when comments are enabled by the author. All commentary is subject to editorial moderation.
            </p>
            <h2 className="text-2xl font-bold pt-4">3. Termination</h2>
            <p>
              HIUHU administrators reserve the right to suspend or terminate accounts that breach platform integrity or violate copyright laws.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
