import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { createProjectSchema, PROJECT_STATUSES } from "@/lib/validation";
import type { Prisma } from "@prisma/client";

/**
 * GET /api/projects
 * List projects with optional filtering, search and sorting.
 *
 * Query params:
 *   status  - one of ACTIVE | ON_HOLD | COMPLETED (filter)
 *   q       - free text search over name / assignedTo / description
 *   sort    - field to sort by: deadline | budget | name | createdAt (default createdAt)
 *   order   - asc | desc (default desc)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status")?.toUpperCase();
    const q = searchParams.get("q")?.trim();
    const sort = searchParams.get("sort") ?? "createdAt";
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";

    const where: Prisma.ProjectWhereInput = {};

    if (status && PROJECT_STATUSES.includes(status as never)) {
      where.status = status as never;
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { assignedTo: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const allowedSort = ["deadline", "budget", "name", "createdAt"];
    const orderBy: Prisma.ProjectOrderByWithRelationInput = {
      [allowedSort.includes(sort) ? sort : "createdAt"]: order,
    };

    const projects = await prisma.project.findMany({ where, orderBy });
    return ok({ projects, count: projects.length });
  } catch (err) {
    return handleError(err);
  }
}

/**
 * POST /api/projects
 * Create a new project.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthorized", 401);

    const body = await req.json();
    const data = createProjectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        name: data.name,
        status: data.status,
        deadline: data.deadline,
        assignedTo: data.assignedTo,
        budget: data.budget,
        description: data.description || null,
      },
    });

    return ok({ project }, 201);
  } catch (err) {
    return handleError(err);
  }
}
