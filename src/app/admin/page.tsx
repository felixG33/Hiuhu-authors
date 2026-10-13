import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Role, ContentStatus } from "@prisma/client";
import {
  FileText,
  Feather,
  BookOpen,
  Users,
  MessageSquare,
  Clock,
  Sparkles,
  ArrowRight,
  Plus,
  TrendingUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const user = await getCurrentUser();

  // Fetch metrics based on role
  const isSuperAdmin = user?.role === Role.SUPER_ADMIN;
  const isAuthorOnly = user?.role === Role.AUTHOR;

  const contentWhere: any = { deletedAt: null };
  if (isAuthorOnly && user?.authorProfileId) {
    contentWhere.authorId = user.authorProfileId;
  }

  let totalAuthors = 1;
  let totalBooks = 0;
  let publishedCount = 0;
  let draftCount = 0;
  let pendingCommentsCount = 0;
  let recentContent: any[] = [];
  let recentLogs: any[] = [];

  try {
    const results = await Promise.all([
      db.authorProfile.count(),
      db.book.count({ where: { deletedAt: null } }),
      db.contentItem.count({ where: { ...contentWhere, status: ContentStatus.PUBLISHED } }),
      db.contentItem.count({ where: { ...contentWhere, status: ContentStatus.DRAFT } }),
      db.comment.count({ where: { status: "PENDING" } }),
      db.contentItem.findMany({
        where: contentWhere,
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: { author: { select: { name: true } }, category: { select: { name: true } } },
      }),
      isSuperAdmin
        ? db.auditLog.findMany({ take: 5, orderBy: { createdAt: "desc" } })
        : Promise.resolve([]),
    ]);
    [
      totalAuthors,
      totalBooks,
      publishedCount,
      draftCount,
      pendingCommentsCount,
      recentContent,
      recentLogs,
    ] = results;
  } catch (error) {
    console.error("Error fetching admin metrics:", error);
  }

  const cards = [
    {
      title: isAuthorOnly ? "My Published Works" : "Published Works",
      value: publishedCount,
      icon: FileText,
      description: "Live on HIUHU public catalog",
      color: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      title: "Drafts in Progress",
      value: draftCount,
      icon: Clock,
      description: "Awaiting editorial review",
      color: "text-amber-800 bg-amber-50 dark:bg-amber-950/40",
    },
    {
      title: "Books & Editions",
      value: totalBooks,
      icon: BookOpen,
      description: "Hardcovers, chapbooks, novels",
      color: "text-blue-700 bg-blue-50 dark:bg-blue-950/40",
    },
    {
      title: "Authors Roster",
      value: totalAuthors,
      icon: Users,
      description: "Resident writers & poets",
      color: "text-purple-700 bg-purple-50 dark:bg-purple-950/40",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900/60 shadow-xs">
        <div className="space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-semibold">
            {user?.role === Role.SUPER_ADMIN ? "HIUHU Administrative Console" : "Editorial Studio"}
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-ink-500 font-mono">
            Platform Status: Online • PostgreSQL Synced • Editorial Ready
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/content/new?type=ARTICLE">
            <Button size="sm" variant="gold" className="gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>Write Article</span>
            </Button>
          </Link>
          <Link href="/admin/content/new?type=POEM">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Feather className="h-3.5 w-3.5 text-amber-700" />
              <span>Draft Poem</span>
            </Button>
          </Link>
          <Link href="/admin/content/new?type=STORY">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <span>Compose Story</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <span className="text-xs font-mono uppercase tracking-wider text-ink-500">
                {card.title}
              </span>
              <div className={`p-2 rounded-sm ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-serif text-3xl font-bold text-ink-950 dark:text-parchment-50">
                {card.value}
              </div>
              <p className="text-[11px] font-mono text-ink-400 mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid: Recent Content & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Content (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold">Recent Publications & Drafts</h3>
            <Link
              href="/admin/content"
              className="text-xs font-mono text-amber-800 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-parchment-100/70 dark:bg-ink-950 font-mono text-ink-500 uppercase tracking-wider border-b border-parchment-200 dark:border-ink-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Author</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-200 dark:divide-ink-800 font-sans">
                {recentContent.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-ink-400">
                      No works drafted yet. Click &ldquo;Write Article&rdquo; above to begin.
                    </td>
                  </tr>
                ) : (
                  recentContent.map((item: any) => (
                    <tr key={item.id} className="hover:bg-parchment-50 dark:hover:bg-ink-800/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-ink-900 dark:text-parchment-100 max-w-[220px] truncate">
                        {item.title}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-ink-500">
                        {item.type}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 font-serif text-ink-700 dark:text-parchment-300">
                        {item.author.name}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/content/${item.id}/edit`}
                          className="text-amber-800 dark:text-amber-400 font-semibold hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Activity (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Comments Queue Widget */}
          <div className="p-5 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-base font-bold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-amber-800" />
                Moderation Queue
              </h4>
              <span className="text-xs font-mono bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full text-amber-800">
                {pendingCommentsCount} pending
              </span>
            </div>
            <p className="text-xs text-ink-600 dark:text-parchment-400 font-serif leading-relaxed">
              {pendingCommentsCount > 0
                ? "There are reader comments awaiting editorial review and approval."
                : "The reader discourse queue is fully caught up."}
            </p>
            {pendingCommentsCount > 0 && (
              <Link href="/admin/comments">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Review Comments
                </Button>
              </Link>
            )}
          </div>

          {/* Audit Trail for Super Admin */}
          {isSuperAdmin && recentLogs.length > 0 && (
            <div className="p-5 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-base font-bold">Audit Trail</h4>
                <Link href="/admin/audit-logs" className="text-xs font-mono text-ink-500 hover:underline">
                  All Logs
                </Link>
              </div>
              <div className="space-y-2.5 divide-y divide-parchment-200 dark:divide-ink-800 text-xs font-mono">
                {recentLogs.map((log: any) => (
                  <div key={log.id} className="pt-2 first:pt-0 space-y-0.5">
                    <div className="flex items-center justify-between text-ink-700 dark:text-parchment-300">
                      <span className="font-semibold text-amber-800 dark:text-amber-400">{log.action}</span>
                      <span className="text-[10px] text-ink-400">{formatDate(log.createdAt)}</span>
                    </div>
                    <p className="text-[11px] text-ink-500 truncate">{log.userEmail || "System"} • {log.entity}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
