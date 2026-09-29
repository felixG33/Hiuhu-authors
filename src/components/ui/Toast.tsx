"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (options: { title: string; message?: string; type?: ToastType }) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, message, type = "info" }: { title: string; message?: string; type?: ToastType }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, message, type }]);
      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const value = {
    toast: addToast,
    success: (title: string, message?: string) => addToast({ title, message, type: "success" }),
    error: (title: string, message?: string) => addToast({ title, message, type: "error" }),
    info: (title: string, message?: string) => addToast({ title, message, type: "info" }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-sm border shadow-lg bg-white dark:bg-ink-900 transition-all duration-300 animate-in slide-in-from-bottom-5",
              t.type === "success" && "border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100",
              t.type === "error" && "border-crimson-300 dark:border-crimson-800 text-crimson-950 dark:text-crimson-100",
              t.type === "info" && "border-ink-200 dark:border-ink-800 text-ink-950 dark:text-parchment-100"
            )}
          >
            {t.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />}
            {t.type === "error" && <AlertCircle className="h-5 w-5 text-crimson-600 shrink-0 mt-0.5" />}
            {t.type === "info" && <Info className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />}

            <div className="flex-1">
              <h4 className="text-sm font-medium leading-none">{t.title}</h4>
              {t.message && <p className="text-xs text-ink-600 dark:text-parchment-400 mt-1">{t.message}</p>}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-ink-400 hover:text-ink-700 dark:hover:text-parchment-200 p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
