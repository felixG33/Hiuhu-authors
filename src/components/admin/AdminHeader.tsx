"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Plus, User, LogOut, ExternalLink, ChevronDown } from "lucide-react";
import { RoleBadge } from "./RoleBadge";
import { Button } from "@/components/ui/Button";
import { Role } from "@prisma/client";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export function AdminHeader({ onToggleSidebar, user }: AdminHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-parchment-300 dark:border-ink-800 bg-white/90 dark:bg-ink-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      {/* Mobile Toggle & Brand indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-sm text-ink-600 hover:text-ink-950 dark:text-parchment-300 dark:hover:text-white md:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <span className="hidden sm:inline-block text-xs font-mono uppercase tracking-widest text-ink-500 dark:text-parchment-400">
          Editorial & Publishing System
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick New Content Button */}
        <Link href="/admin/content/new">
          <Button size="sm" variant="gold" className="gap-1.5 hidden sm:inline-flex">
            <Plus className="h-3.5 w-3.5" />
            <span>New Publication</span>
          </Button>
        </Link>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-sm hover:bg-parchment-100 dark:hover:bg-ink-900 transition-colors select-none text-left"
          >
            <div className="w-8 h-8 rounded-full bg-ink-950 dark:bg-parchment-100 text-parchment-50 dark:text-ink-950 flex items-center justify-center font-serif text-sm font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-medium text-ink-900 dark:text-parchment-100 leading-tight">
                {user.name}
              </span>
              <div className="mt-0.5">
                <RoleBadge role={user.role} />
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-ink-400" />
          </button>

          {/* Dropdown Card */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 mt-2 w-56 rounded-sm border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-lg z-50 p-1.5 animate-in fade-in-50 zoom-in-95">
                <div className="px-3 py-2 border-b border-parchment-200 dark:border-ink-800">
                  <p className="text-xs font-medium text-ink-900 dark:text-parchment-100">{user.name}</p>
                  <p className="text-[11px] text-ink-500 truncate">{user.email}</p>
                </div>

                <div className="py-1">
                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-2 px-3 py-1.5 text-xs text-ink-700 dark:text-parchment-300 hover:bg-parchment-100 dark:hover:bg-ink-800 rounded-xs"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Visit Public Site
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-crimson-600 hover:bg-crimson-50 dark:hover:bg-crimson-950/40 rounded-xs text-left"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
