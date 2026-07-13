import { ok } from "@/lib/api";
import { clearAuthCookie } from "@/lib/auth";

/** POST /api/auth/logout — clear the auth cookie. */
export async function POST() {
  clearAuthCookie();
  return ok({ success: true });
}
