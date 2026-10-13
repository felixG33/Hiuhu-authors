"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Feather,
  BookOpen,
  FileText,
  Bookmark,
  Layers,
  Tag,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  Compass,
  Search,
  BarChart3,
  Settings,
  History,
  ExternalLink,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { Logo } from "@/components/branding/Logo";
import { Role } from "@prisma/client";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  userRole?: Role;
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ userRole = Role.SUPER_ADMIN, isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const isSuperAdmin = userRole === Role.SUPER_ADMIN;
  const isEditor = userRole === Role.SUPER_ADMIN || userRole === Role.EDITOR;

  const navigationGroups = [
    {
      title: "Workspace",
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "Readership Insights", href: "/admin/analytics", icon: BarChart3 },
      ],
    },
    {
      title: "Author Works",
      items: [
        { label: "All Publications", href: "/admin/content", icon: FileText },
        { label: "Articles & Essays", href: "/admin/content?type=ARTICLE", icon: FileText },
        { label: "Poetry & Verse", href: "/admin/content?type=POEM", icon: Feather },
        { label: "Short Stories", href: "/admin/content?type=STORY", icon: Bookmark },
        { label: "Books & Editions", href: "/admin/books", icon: BookOpen },
        { label: "Media Assets", href: "/admin/media", icon: ImageIcon },
      ],
    },
    {
      title: "Author Profile & Discourse",
      items: [
        { label: "Author Folio & Bio", href: "/admin/authors", icon: UserCheck },
        ...(isEditor ? [{ label: "Reader Comments", href: "/admin/comments", icon: MessageSquare }] : []),
        ...(isSuperAdmin ? [{ label: "Users & Readers", href: "/admin/users", icon: Users }] : []),
      ],
    },
    {
      title: "Categories & Taxonomies",
      items: [
        { label: "Literary Categories", href: "/admin/categories", icon: Layers },
        { label: "Faceted Tags", href: "/admin/tags", icon: Tag },
      ],
    },
    ...(isSuperAdmin
      ? [
          {
            title: "Site & Design",
            items: [
              { label: "Homepage CMS", href: "/admin/homepage", icon: Sparkles },
              { label: "Navigation Menus", href: "/admin/navigation", icon: Compass },
              { label: "Global SEO", href: "/admin/seo", icon: Search },
              { label: "Site Settings", href: "/admin/settings", icon: Settings },
              { label: "Audit Logs", href: "/admin/audit-logs", icon: History },
            ],
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink-950/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-ink-800 bg-ink-950 text-parchment-100 flex flex-col transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Sidebar Header with HIUHU Branding */}
        <div className="h-16 px-6 border-b border-ink-800/80 flex items-center justify-between">
          <Logo variant="admin" size="sm" showTagline={false} href="/admin" />
          <span className="text-[10px] font-mono tracking-widest text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-xs border border-amber-800/40">
            STUDIO
          </span>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {navigationGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <h4 className="px-3 text-[11px] font-mono uppercase tracking-wider text-ink-400/80">
                {group.title}
              </h4>
              <div className="space-y-0.5 pt-1">
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href.split("?")[0]) &&
                        (!item.href.includes("?") || pathname === item.href);

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-xs text-xs font-medium tracking-wide transition-colors group select-none",
                        isActive
                          ? "bg-amber-950/40 text-amber-300 border-l-2 border-amber-400 pl-2.5"
                          : "text-parchment-200/80 hover:text-white hover:bg-ink-900"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive ? "text-amber-400" : "text-ink-400 group-hover:text-parchment-100"
                        )}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {isActive && <ChevronRight className="h-3 w-3 text-amber-400/70" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Link to Public Website */}
        <div className="p-4 border-t border-ink-800/80 bg-ink-900/40">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs text-parchment-300 hover:text-white hover:bg-ink-800 rounded-xs transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 text-amber-400" />
              Visit Author Folio
            </span>
            <span className="text-[10px] font-mono text-ink-400">Live ↗</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
