import { STATUS_LABELS, type ProjectStatusValue } from "@/lib/validation";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** yyyy-mm-dd for <input type="date"> from an ISO string. */
export function toDateInput(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

export function statusLabel(status: ProjectStatusValue): string {
  return STATUS_LABELS[status];
}

/** Tailwind classes for the coloured status badge. */
export function statusClasses(status: ProjectStatusValue): string {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    case "ON_HOLD":
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
    case "COMPLETED":
      return "bg-slate-100 text-slate-600 ring-slate-500/20";
  }
}

/** True when a deadline is in the past and the project isn't completed. */
export function isOverdue(iso: string, status: ProjectStatusValue): boolean {
  return status !== "COMPLETED" && new Date(iso).getTime() < Date.now();
}
