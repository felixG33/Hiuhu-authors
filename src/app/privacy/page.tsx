import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Privacy Policy",
  description: "Privacy policy for HIUHU Literary Press and Publishing Platform.",
  canonicalUrl: "/privacy",
});

export default async function PrivacyPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen flex flex-col text-ink-950 dark:text-parchment-50">
      <Header user={user} />

      <main className="flex-1 py-16">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 space-y-8">
          <h1 className="font-serif text-4xl font-bold">Privacy Policy</h1>
          <p className="text-xs font-mono text-ink-500">Effective Date: October 2026</p>

          <div className="editorial-prose space-y-6 text-base leading-relaxed font-serif text-ink-800 dark:text-parchment-200">
            <p>
              At HIUHU, we respect authorial dignity and reader privacy. We do not sell user data, nor do we employ invasive ad trackers.
            </p>
            <h2 className="text-2xl font-bold pt-4">1. Information We Collect</h2>
            <p>
              When you register as an author or reader, we collect your name, email address, and optionally your biography and literary profile information. Account authentication utilizes secure salted password hashes and encrypted session cookies.
            </p>
            <h2 className="text-2xl font-bold pt-4">2. Author Content & Copyright</h2>
            <p>
              Authors retain complete intellectual copyright over their submitted literary works, books, poems, stories, and articles. By publishing on HIUHU, authors grant HIUHU a non-exclusive license to display the content on the public platform.
            </p>
            <h2 className="text-2xl font-bold pt-4">3. Data Security & Storage</h2>
            <p>
              All data is stored in secure database infrastructures using SSL transport encryption and modern access control principles.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
