"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Search, ShieldAlert, FileCode, Clock, Loader2 } from "lucide-react";

interface AuditLogRecord {
  id: string;
  userId: string | null;
  userEmail: string;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: string | null;
  ipAddress: string | null;
  createdAt: string;
  user?: {
    name: string;
    role: string;
  } | null;
}

export default function AuditLogsAdminPage() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="border-b border-parchment-300 dark:border-ink-800 pb-4">
        <h1 className="font-serif text-2xl font-bold">Audit Trail & Governance Logs</h1>
        <p className="text-xs text-ink-500 font-serif italic">
          Immutable event log of editorial publications, administrative actions, and system modifications.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
          <Input
            placeholder="Search action, email, entity..."
            className="pl-9 py-1.5 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-ink-400" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-parchment-300 rounded-sm">
          <Clock className="h-8 w-8 mx-auto text-ink-300 mb-2" />
          <p className="text-sm text-ink-500 font-serif">No audit events found.</p>
        </div>
      ) : (
        <div className="border border-parchment-300 dark:border-ink-800 rounded-sm overflow-hidden bg-white dark:bg-ink-900 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-parchment-100 dark:bg-ink-800/60 border-b border-parchment-200 dark:border-ink-800 text-ink-600 dark:text-parchment-300 uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Action</th>
                  <th className="py-3 px-4 font-semibold">Entity</th>
                  <th className="py-3 px-4 font-semibold">Actor Email</th>
                  <th className="py-3 px-4 font-semibold">IP Address</th>
                  <th className="py-3 px-4 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-200 dark:divide-ink-800 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-parchment-50/50 dark:hover:bg-ink-800/30 transition-colors">
                    <td className="py-3 px-4 text-ink-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[11px] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-serif font-medium text-ink-900 dark:text-parchment-100">
                      {log.entity} {log.entityId ? <span className="font-mono text-ink-400 text-[10px]">({log.entityId.slice(0, 8)}...)</span> : ""}
                    </td>
                    <td className="py-3 px-4 text-ink-700 dark:text-parchment-300">
                      {log.userEmail}
                    </td>
                    <td className="py-3 px-4 text-ink-400">
                      {log.ipAddress || "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {log.metadata ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs px-2 gap-1 text-ink-600 font-sans"
                          onClick={() => setSelectedLog(log)}
                        >
                          <FileCode className="h-3 w-3" />
                          View
                        </Button>
                      ) : (
                        <span className="text-ink-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Metadata Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white dark:bg-ink-900 border border-parchment-300 dark:border-ink-800 rounded-sm max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-parchment-200 dark:border-ink-800 pb-2">
              <h3 className="font-serif text-lg font-bold">Audit Event Metadata</h3>
              <span className="font-mono text-xs text-ink-400">{selectedLog.action}</span>
            </div>

            <div className="text-xs space-y-1 font-mono text-ink-600 dark:text-parchment-300">
              <p>Actor: <span className="font-bold">{selectedLog.userEmail}</span></p>
              <p>Entity: {selectedLog.entity} ({selectedLog.entityId})</p>
              <p>Timestamp: {new Date(selectedLog.createdAt).toISOString()}</p>
            </div>

            <pre className="p-3 rounded bg-parchment-100 dark:bg-ink-950 text-[11px] font-mono text-ink-800 dark:text-parchment-200 overflow-x-auto max-h-60 border border-parchment-200 dark:border-ink-800">
              {JSON.stringify(JSON.parse(selectedLog.metadata || "{}"), null, 2)}
            </pre>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
