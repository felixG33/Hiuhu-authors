import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "HIUHU — Author & Poet Literary Folio",
  description:
    "The official literary sanctuary and personal folio of author, poet, and essayist HIUHU. Explore published books, poetics, contemplative essays, and fiction.",
  keywords: ["HIUHU", "author", "poet", "literature", "books", "poetry", "fiction", "essays", "publishing"],
  authors: [{ name: "HIUHU" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "HIUHU — Author & Poet Literary Folio",
    description: "The personal literary sanctuary of author, poet, and essayist HIUHU.",
    url: "https://hiuhu.org",
    siteName: "HIUHU",
    images: [{ url: "/background.jpg", width: 1920, height: 1080, alt: "HIUHU Author's Desk & Folio" }],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen relative text-ink-950 dark:text-parchment-50 font-serif antialiased selection:bg-amber-800/20 selection:text-ink-950">
        {/* Fixed Scenic Author Desk Background */}
        <div
          className="fixed inset-0 -z-30 bg-cover bg-center bg-no-repeat bg-fixed pointer-events-none"
          style={{ backgroundImage: "url('/background.jpg')" }}
        />

        {/* Ambient Warm Translucent Wash for High Text Contrast */}
        <div
          className="fixed inset-0 -z-20 bg-parchment-50/75 dark:bg-ink-950/85 backdrop-blur-[1px] pointer-events-none transition-colors"
        />

        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
