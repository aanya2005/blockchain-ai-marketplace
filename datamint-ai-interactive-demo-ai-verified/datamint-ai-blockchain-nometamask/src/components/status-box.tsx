import type React from "react";

export function StatusBox({ type = "info", children }: { type?: "info" | "error" | "success"; children: React.ReactNode }) {
  const styles = {
    info: "border-cyan-200 bg-cyan-50 text-cyan-800",
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };
  return <div className={`rounded-2xl border px-4 py-3 text-sm ${styles[type]}`}>{children}</div>;
}
