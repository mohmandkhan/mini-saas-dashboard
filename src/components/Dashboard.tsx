"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AuthUser, Project } from "@/types";
import { PROJECT_STATUSES, type ProjectStatusValue } from "@/lib/validation";
import { Filters } from "@/components/Filters";
import { ProjectTable } from "@/components/ProjectTable";
import { ProjectModal } from "@/components/ProjectModal";
import { formatCurrency } from "@/lib/format";

type StatusFilter = ProjectStatusValue | "ALL";

export function Dashboard({ user }: { user: AuthUser }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  // Debounce the search input so we don't refetch on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status !== "ALL") params.set("status", status);
      if (debouncedSearch) params.set("q", debouncedSearch);
      const res = await fetch(`/api/projects?${params.toString()}`);
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load projects");
      setProjects(data.projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [status, debouncedSearch]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status === "ACTIVE").length;
    const budget = projects.reduce((sum, p) => sum + p.budget, 0);
    return { total, active, budget };
  }, [projects]);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(project: Project) {
    setEditing(project);
    setModalOpen(true);
  }

  async function handleDelete(project: Project) {
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to delete project");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Projects</h1>
            <p className="text-sm text-slate-500">Signed in as {user.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total projects" value={String(stats.total)} />
          <StatCard label="Active" value={String(stats.active)} />
          <StatCard label="Total budget" value={formatCurrency(stats.budget)} />
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <Filters
              search={search}
              onSearchChange={setSearch}
              status={status}
              onStatusChange={setStatus}
              statuses={PROJECT_STATUSES}
            />
            <button
              onClick={openCreate}
              className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              + Add project
            </button>
          </div>

          <ProjectTable
            projects={projects}
            loading={loading}
            error={error}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </div>
      </main>

      {modalOpen && (
        <ProjectModal
          project={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            fetchProjects();
          }}
        />
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
