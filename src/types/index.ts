import type { ProjectStatusValue } from "@/lib/validation";

// Shape of a project as returned by the API (dates serialised to ISO strings).
export interface Project {
  id: string;
  name: string;
  status: ProjectStatusValue;
  deadline: string;
  assignedTo: string;
  budget: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

// Payload used by the add/edit modal form.
export interface ProjectFormValues {
  name: string;
  status: ProjectStatusValue;
  deadline: string; // yyyy-mm-dd
  assignedTo: string;
  budget: string; // kept as string in the form, coerced on submit
  description: string;
}
