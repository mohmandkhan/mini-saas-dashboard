import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ok, fail, handleError } from "@/lib/api";
import { loginSchema } from "@/lib/validation";
import { signToken, setAuthCookie } from "@/lib/auth";

/** POST /api/auth/login — exchange email + password for an auth cookie. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });
    // Use the same generic message whether the email or password is wrong.
    if (!user) return fail("Invalid email or password", 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return fail("Invalid email or password", 401);

    const token = await signToken({ sub: user.id, email: user.email, name: user.name });
    setAuthCookie(token);

    return ok({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    return handleError(err);
  }
}
