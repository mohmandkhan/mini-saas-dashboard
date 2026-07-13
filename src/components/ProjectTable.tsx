"use client";

import type { Project } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate, isOverdue } from "@/lib/format";

export function ProjectTable({
  projects,
  loading,
  error,
  onEdit,
  onDelete,
}: {
  projects: Project[];
  loading: boolean;
  error: string | null;
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
}) {
  if (error) {
    return (
      <div className="p-8 text-center text-sm text-red-600">{error}</div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">Loading projects…</div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm font-medium text-slate-900">No projects found</p>
        <p className="mt-1 text-sm text-slate-500">
          Try adjusting your search or filters, or add a new project.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Project</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Assigned to</th>
            <th className="px-4 py-3">Deadline</th>
            <th className="px-4 py-3 text-right">Budget</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {projects.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <div className="font-medium text-slate-900">{p.name}</div>
                {p.description && (
                  <div className="max-w-xs truncate text-xs text-slate-500">
                    {p.description}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={p.status} />
              </td>
              <td className="px-4 py-3 text-slate-700">{p.assignedTo}</td>
              <td className="px-4 py-3">
                <span
                  className={
                    isOverdue(p.deadline, p.status)
                      ? "font-medium text-red-600"
                      : "text-slate-700"
                  }
                  title={isOverdue(p.deadline, p.status) ? "Overdue" : undefined}
                >
                  {formatDate(p.deadline)}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-medium text-slate-900">
                {formatCurrency(p.budget)}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(p)}
                    className="rounded-md px-2.5 py-1 text-sm font-medium text-brand-600 transition hover:bg-brand-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(p)}
                    className="rounded-md px-2.5 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
