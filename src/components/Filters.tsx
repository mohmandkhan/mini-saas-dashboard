"use client";

import { STATUS_LABELS, type ProjectStatusValue } from "@/lib/validation";

type StatusFilter = ProjectStatusValue | "ALL";

export function Filters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  statuses,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  status: StatusFilter;
  onStatusChange: (v: StatusFilter) => void;
  statuses: readonly ProjectStatusValue[];
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 3.4 9.82l3.14 3.14a.75.75 0 1 0 1.06-1.06l-3.14-3.14A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search name, member…"
          aria-label="Search projects"
          className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:w-64"
        />
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
        <FilterChip
          active={status === "ALL"}
          onClick={() => onStatusChange("ALL")}
          label="All"
        />
        {statuses.map((s) => (
          <FilterChip
            key={s}
            active={status === s}
            onClick={() => onStatusChange(s)}
            label={STATUS_LABELS[s]}
          />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md px-3 py-1 text-sm font-medium transition ${
        active
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {label}
    </button>
  );
}
