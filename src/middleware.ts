import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, verifyToken } from "@/lib/auth";

/**
 * Route protection.
 *  - Unauthenticated users hitting /dashboard are redirected to /login.
 *  - Authenticated users hitting /login or /register are sent to /dashboard.
 *
 * Runs on the Edge runtime; `jose` verification works there.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const user = token ? await verifyToken(token) : null;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isProtected = pathname === "/" || pathname.startsWith("/dashboard");

  if (isProtected && !user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthPage && user) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/login", "/register"],
};
