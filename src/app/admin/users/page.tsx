"use client";

import React, { useState, useEffect } from "react";
import { Role } from "@prisma/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { RoleBadge } from "@/components/admin/RoleBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { Search, ShieldAlert, Trash2, Edit2, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string | null;
  emailVerified: boolean;
  createdAt: string;
  authorProfile?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count?: {
    comments: number;
  };
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [newRole, setNewRole] = useState<Role>(Role.READER);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { success, error: toastError } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedRole !== "ALL") params.set("role", selectedRole);

      const res = await fetch(`/api/users?${params.toString()}`);
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      toastError("Failed to fetch user list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedRole]);

  const handleUpdateRole = async () => {
    if (!editingUser) return;
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");

      success(`Updated role for ${editingUser.name} to ${newRole}`);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      toastError(err.message || "Failed to update user role");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/users/${deletingUser.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user");

      success(`User account ${deletingUser.email} deleted`);
      setDeletingUser(null);
      fetchUsers();
    } catch (err: any) {
      toastError(err.message || "Failed to delete user account");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-parchment-300 dark:border-ink-800 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold">User Directory & RBAC</h1>
          <p className="text-xs text-ink-500 font-serif italic">
            Manage platform members, permission tiers, and editorial authority.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
          <Input
            placeholder="Search users..."
            className="pl-9 py-1.5 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-serif text-ink-600 dark:text-parchment-400 whitespace-nowrap">
            Filter Role:
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-sm border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-900"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            <option value="EDITOR">EDITOR</option>
            <option value="AUTHOR">AUTHOR</option>
            <option value="READER">READER</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-parchment-300 rounded-sm">
          <p className="text-sm text-ink-500 font-serif">No users found matching query.</p>
        </div>
      ) : (
        <div className="border border-parchment-300 dark:border-ink-800 rounded-sm overflow-hidden bg-white dark:bg-ink-900 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-parchment-100 dark:bg-ink-800/60 border-b border-parchment-200 dark:border-ink-800 text-ink-600 dark:text-parchment-300 uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-4 font-semibold">User</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Author Profile</th>
                  <th className="py-3 px-4 font-semibold">Verified</th>
                  <th className="py-3 px-4 font-semibold">Joined</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-200 dark:divide-ink-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-parchment-50/50 dark:hover:bg-ink-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-parchment-200 dark:bg-ink-700 flex items-center justify-center font-serif font-bold text-ink-800 dark:text-parchment-100">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-serif font-medium text-ink-900 dark:text-parchment-100">{u.name}</p>
                          <p className="text-xs text-ink-500 font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="py-3 px-4">
                      {u.authorProfile ? (
                        <span className="font-serif text-ink-700 dark:text-parchment-300">
                          {u.authorProfile.name}
                        </span>
                      ) : (
                        <span className="text-ink-400 italic">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {u.emailVerified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-ink-400">
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Unverified</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-ink-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2 gap-1"
                          onClick={() => {
                            setEditingUser(u);
                            setNewRole(u.role);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                          Role
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2 text-crimson-600 hover:text-crimson-700 hover:bg-crimson-50 dark:hover:bg-crimson-950/30"
                          onClick={() => setDeletingUser(u)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white dark:bg-ink-900 border border-parchment-300 dark:border-ink-800 rounded-sm max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-serif text-lg font-bold">Edit Role for {editingUser.name}</h3>
            <p className="text-xs text-ink-600 dark:text-parchment-400">
              Select the administrative permissions tier for <span className="font-mono">{editingUser.email}</span>.
            </p>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-mono font-semibold uppercase text-ink-700 dark:text-parchment-300">
                Designated Role:
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className="w-full text-xs p-2 rounded-sm border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-950"
              >
                <option value="SUPER_ADMIN">SUPER_ADMIN (Full platform governance)</option>
                <option value="EDITOR">EDITOR (Publishing & moderation authority)</option>
                <option value="AUTHOR">AUTHOR (Own manuscripts and profile only)</option>
                <option value="READER">READER (Read, bookmark, comment)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-parchment-200 dark:border-ink-800">
              <Button variant="ghost" size="sm" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button variant="gold" size="sm" isLoading={isUpdating} onClick={handleUpdateRole}>
                Save Role
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirm Dialog */}
      <ConfirmDialog
        open={!!deletingUser}
        title="Delete User Account"
        description={`Are you sure you want to delete user account "${deletingUser?.email}"? This action cannot be reversed.`}
        confirmLabel="Delete User"
        variant="danger"
        isLoading={isUpdating}
        onConfirm={handleDeleteUser}
        onCancel={() => setDeletingUser(null)}
      />
    </div>
  );
}
