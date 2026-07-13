import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ok, fail, handleError } from "@/lib/api";
import { registerSchema } from "@/lib/validation";
import { signToken, setAuthCookie } from "@/lib/auth";

/** POST /api/auth/register — create an account and sign the user in. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return fail("An account with that email already exists", 409);

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: passwordHash },
    });

    const token = await signToken({ sub: user.id, email: user.email, name: user.name });
    setAuthCookie(token);

    return ok({ user: { id: user.id, email: user.email, name: user.name } }, 201);
  } catch (err) {
    return handleError(err);
  }
}
