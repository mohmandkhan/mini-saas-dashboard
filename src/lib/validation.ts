import { z } from "zod";

// Keep in sync with the Prisma `ProjectStatus` enum.
export const PROJECT_STATUSES = ["ACTIVE", "ON_HOLD", "COMPLETED"] as const;
export type ProjectStatusValue = (typeof PROJECT_STATUSES)[number];

export const STATUS_LABELS: Record<ProjectStatusValue, string> = {
  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
};

// Body accepted when creating a project.
export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  status: z.enum(PROJECT_STATUSES),
  // Accept an ISO date string or yyyy-mm-dd and coerce to a Date.
  deadline: z.coerce.date({ invalid_type_error: "Deadline must be a valid date" }),
  assignedTo: z.string().trim().min(1, "Assigned team member is required").max(120),
  budget: z.coerce.number().int("Budget must be a whole number").min(0, "Budget cannot be negative"),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});

// All fields optional on update (PATCH-like PUT).
export const updateProjectSchema = createProjectSchema.partial();

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
