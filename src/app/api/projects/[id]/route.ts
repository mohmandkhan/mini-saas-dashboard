import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { updateProjectSchema } from "@/lib/validation";
import { Prisma } from "@prisma/client";

interface Params {
  params: { id: string };
}

/** GET /api/projects/:id — fetch a single project. */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthorized", 401);

    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) return fail("Project not found", 404);
    return ok({ project });
  } catch (err) {
    return handleError(err);
  }
}

/** PUT /api/projects/:id — update a project. */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthorized", 401);

    const body = await req.json();
    const data = updateProjectSchema.parse(body);

    if (Object.keys(data).length === 0) {
      return fail("No fields to update", 400);
    }

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...data,
        // normalise empty description to null
        description:
          data.description === "" ? null : data.description ?? undefined,
      },
    });

    return ok({ project });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return fail("Project not found", 404);
    }
    return handleError(err);
  }
}

/** DELETE /api/projects/:id — remove a project. */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Unauthorized", 401);

    await prisma.project.delete({ where: { id: params.id } });
    return ok({ success: true });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return fail("Project not found", 404);
    }
    return handleError(err);
  }
}
