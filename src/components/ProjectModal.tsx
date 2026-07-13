"use client";

import { useEffect, useState } from "react";
import type { Project, ProjectFormValues } from "@/types";
import {
  PROJECT_STATUSES,
  STATUS_LABELS,
  type ProjectStatusValue,
} from "@/lib/validation";
import { toDateInput } from "@/lib/format";

function emptyForm(): ProjectFormValues {
  return {
    name: "",
    status: "ACTIVE",
    deadline: new Date().toISOString().slice(0, 10),
    assignedTo: "",
    budget: "",
    description: "",
  };
}

function fromProject(p: Project): ProjectFormValues {
  return {
    name: p.name,
    status: p.status,
    deadline: toDateInput(p.deadline),
    assignedTo: p.assignedTo,
    budget: String(p.budget),
    description: p.description ?? "",
  };
}

export function ProjectModal({
  project,
  onClose,
  onSaved,
}: {
  project: Project | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(project);
  const [form, setForm] = useState<ProjectFormValues>(
    project ? fromProject(project) : emptyForm(),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function update<K extends keyof ProjectFormValues>(
    key: K,
    value: ProjectFormValues[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});

    const payload = {
      name: form.name,
      status: form.status,
      deadline: form.deadline,
      assignedTo: form.assignedTo,
      budget: Number(form.budget),
      description: form.description,
    };

    const url = isEdit ? `/api/projects/${project!.id}` : "/api/projects";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 422 && data.details) setFieldErrors(data.details);
        throw new Error(data.error ?? "Failed to save project");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save project");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
            {isEdit ? "Edit project" : "Add project"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <Field label="Project name" errors={fieldErrors.name}>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="input"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Status" errors={fieldErrors.status}>
              <select
                value={form.status}
                onChange={(e) =>
                  update("status", e.target.value as ProjectStatusValue)
                }
                className="input"
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Deadline" errors={fieldErrors.deadline}>
              <input
                type="date"
                required
                value={form.deadline}
                onChange={(e) => update("deadline", e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Assigned team member" errors={fieldErrors.assignedTo}>
              <input
                type="text"
                required
                value={form.assignedTo}
                onChange={(e) => update("assignedTo", e.target.value)}
                className="input"
              />
            </Field>

            <Field label="Budget (USD)" errors={fieldErrors.budget}>
              <input
                type="number"
                min={0}
                step={1}
                required
                value={form.budget}
                onChange={(e) => update("budget", e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <Field label="Description (optional)" errors={fieldErrors.description}>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="input resize-none"
            />
          </Field>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  errors,
  children,
}: {
  label: string;
  errors?: string[];
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {errors?.length ? (
        <span className="mt-1 block text-xs text-red-600">{errors[0]}</span>
      ) : null}
    </label>
  );
}
