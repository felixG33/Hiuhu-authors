"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Users, FileText, Feather, Eye, Clock, MessageSquare, Loader2, ArrowUpRight } from "lucide-react";

interface AnalyticsData {
  metrics: {
    totalAuthors: number;
    totalBooks: number;
    publishedArticles: number;
    publishedPoems: number;
    publishedStories: number;
    totalPublished: number;
    pendingDrafts: number;
    pendingComments: number;
  };
  topAuthors: Array<{
    id: string;
    name: string;
    slug: string;
    photo: string | null;
    _count: {
      contentItems: number;
      books: number;
    };
  }>;
  popularContent: Array<{
    id: string;
    title: string;
    slug: string;
    type: string;
    viewsCount: number;
    author: {
      name: string;
    };
  }>;
  recentLogs: Array<{
    id: string;
    action: string;
    entity: string;
    userEmail: string;
    createdAt: string;
  }>;
}

export default function AnalyticsAdminPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const res = await fetch("/api/analytics");
        const json = await res.json();
        if (json.metrics) {
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex justify-center p-16">
        <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
      </div>
    );
  }

  const { metrics, topAuthors, popularContent, recentLogs } = data;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="border-b border-parchment-300 dark:border-ink-800 pb-4">
        <h1 className="font-serif text-2xl font-bold">Literary Analytics & Insights</h1>
        <p className="text-xs text-ink-500 font-serif italic">
          Audience readership metrics, catalog expansion, and publishing productivity telemetry.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-xs">
          <div className="flex items-center justify-between text-ink-500">
            <span className="font-mono text-xs uppercase tracking-wider">Total Published</span>
            <FileText className="h-4 w-4 text-amber-700" />
          </div>
          <div className="font-serif text-3xl font-bold text-ink-900 dark:text-parchment-100 mt-2">
            {metrics.totalPublished}
          </div>
          <p className="text-[11px] font-mono text-ink-400 mt-1">
            {metrics.publishedArticles} arts · {metrics.publishedPoems} poems · {metrics.publishedStories} stories
          </p>
        </div>

        <div className="p-5 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-xs">
          <div className="flex items-center justify-between text-ink-500">
            <span className="font-mono text-xs uppercase tracking-wider">Author Profiles</span>
            <Users className="h-4 w-4 text-amber-700" />
          </div>
          <div className="font-serif text-3xl font-bold text-ink-900 dark:text-parchment-100 mt-2">
            {metrics.totalAuthors}
          </div>
          <p className="text-[11px] font-mono text-ink-400 mt-1">Active literary voices</p>
        </div>

        <div className="p-5 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-xs">
          <div className="flex items-center justify-between text-ink-500">
            <span className="font-mono text-xs uppercase tracking-wider">Book Catalog</span>
            <BookOpen className="h-4 w-4 text-amber-700" />
          </div>
          <div className="font-serif text-3xl font-bold text-ink-900 dark:text-parchment-100 mt-2">
            {metrics.totalBooks}
          </div>
          <p className="text-[11px] font-mono text-ink-400 mt-1">Volumes & chapbooks</p>
        </div>

        <div className="p-5 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-xs">
          <div className="flex items-center justify-between text-ink-500">
            <span className="font-mono text-xs uppercase tracking-wider">Pending Moderation</span>
            <MessageSquare className="h-4 w-4 text-amber-700" />
          </div>
          <div className="font-serif text-3xl font-bold text-ink-900 dark:text-parchment-100 mt-2">
            {metrics.pendingComments}
          </div>
          <p className="text-[11px] font-mono text-ink-400 mt-1">{metrics.pendingDrafts} drafts in progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Most Read Works */}
        <div className="p-6 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-parchment-200 dark:border-ink-800 pb-3">
            <h3 className="font-serif text-base font-bold text-ink-900 dark:text-parchment-100 flex items-center gap-2">
              <Eye className="h-4 w-4 text-amber-700" />
              Most Read Publications
            </h3>
            <span className="text-xs font-mono text-ink-400">Total Views</span>
          </div>

          <div className="divide-y divide-parchment-100 dark:divide-ink-800">
            {popularContent.map((item, idx) => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs text-ink-400 w-4 pt-0.5">#{idx + 1}</span>
                  <div>
                    <Link
                      href={`/${item.type.toLowerCase()}s/${item.slug}`}
                      className="font-serif font-semibold text-sm text-ink-900 dark:text-parchment-100 hover:text-amber-700 dark:hover:text-amber-400 inline-flex items-center gap-1"
                    >
                      {item.title}
                      <ArrowUpRight className="h-3 w-3 text-ink-400" />
                    </Link>
                    <p className="text-xs text-ink-500 font-serif">
                      By {item.author.name} · <span className="font-mono uppercase text-[10px]">{item.type}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-ink-900 dark:text-parchment-100">
                    {item.viewsCount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-ink-400 block font-mono">views</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prolific Authors */}
        <div className="p-6 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-parchment-200 dark:border-ink-800 pb-3">
            <h3 className="font-serif text-base font-bold text-ink-900 dark:text-parchment-100 flex items-center gap-2">
              <Feather className="h-4 w-4 text-amber-700" />
              Prolific Authors & Catalog Contributors
            </h3>
            <span className="text-xs font-mono text-ink-400">Contributions</span>
          </div>

          <div className="divide-y divide-parchment-100 dark:divide-ink-800">
            {topAuthors.map((author) => (
              <div key={author.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-parchment-200 border border-parchment-300 flex items-center justify-center font-serif font-bold text-sm">
                    {author.photo ? (
                      <img src={author.photo} alt={author.name} className="w-full h-full object-cover" />
                    ) : (
                      author.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/admin/authors/${author.id}/edit`}
                      className="font-serif font-semibold text-sm text-ink-900 dark:text-parchment-100 hover:underline"
                    >
                      {author.name}
                    </Link>
                    <p className="text-xs font-mono text-ink-400">/{author.slug}</p>
                  </div>
                </div>

                <div className="text-right font-mono text-xs text-ink-600 dark:text-parchment-300">
                  <p className="font-bold">{author._count.contentItems} published</p>
                  <p className="text-[11px] text-ink-400">{author._count.books} books</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent System Audit Activity */}
      <div className="p-6 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-parchment-200 dark:border-ink-800 pb-3">
          <h3 className="font-serif text-base font-bold text-ink-900 dark:text-parchment-100 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-700" />
            Recent Platform Administrative Operations
          </h3>
          <Link href="/admin/audit-logs" className="text-xs font-mono text-amber-700 hover:underline">
            View full audit trail &rarr;
          </Link>
        </div>

        <div className="divide-y divide-parchment-100 dark:divide-ink-800 text-xs font-mono">
          {recentLogs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-parchment-100 dark:bg-ink-800 text-ink-700 dark:text-parchment-200 text-[11px] font-bold">
                  {log.action}
                </span>
                <span className="text-ink-600 dark:text-parchment-400 font-serif">
                  {log.entity} target by {log.userEmail}
                </span>
              </div>
              <span className="text-ink-400 text-[11px]">
                {new Date(log.createdAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
