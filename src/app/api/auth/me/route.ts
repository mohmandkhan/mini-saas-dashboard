import { ok, fail } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

/** GET /api/auth/me — return the currently authenticated user, if any. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return fail("Unauthorized", 401);
  return ok({ user: { id: user.sub, email: user.email, name: user.name } });
}
