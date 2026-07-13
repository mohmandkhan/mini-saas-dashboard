import { statusClasses, statusLabel } from "@/lib/format";
import type { ProjectStatusValue } from "@/lib/validation";

export function StatusBadge({ status }: { status: ProjectStatusValue }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusClasses(
        status,
      )}`}
    >
      {statusLabel(status)}
    </span>
  );
}
