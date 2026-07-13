import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

/**
 * Auth helpers built on JWT stored in an httpOnly cookie.
 *
 * We use `jose` (not `jsonwebtoken`) so the same code runs in both the Node
 * runtime and the Edge runtime, and because it has zero native dependencies.
 */

export const AUTH_COOKIE = "auth_token";

const DEFAULT_EXPIRES_IN = 60 * 60 * 24 * 7; // 7 days

function getExpiresIn(): number {
  const raw = process.env.JWT_EXPIRES_IN_SECONDS;
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_EXPIRES_IN;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set. Add it to your .env file.");
  }
  return new TextEncoder().encode(secret);
}

export interface AuthPayload {
  sub: string; // user id
  email: string;
  name: string;
}

/** Sign a JWT for the given user payload. */
export async function signToken(payload: AuthPayload): Promise<string> {
  const expiresIn = getExpiresIn();
  return new SignJWT({ email: payload.email, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
    .sign(getSecretKey());
}

/** Verify a JWT and return its payload, or null if invalid/expired. */
export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      email: (payload.email as string) ?? "",
      name: (payload.name as string) ?? "",
    };
  } catch {
    return null;
  }
}

/** Write the auth cookie (httpOnly, sameSite=lax). */
export function setAuthCookie(token: string): void {
  cookies().set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getExpiresIn(),
  });
}

/** Remove the auth cookie. */
export function clearAuthCookie(): void {
  cookies().delete(AUTH_COOKIE);
}

/** Read + verify the current user from the request cookie. */
export async function getCurrentUser(): Promise<AuthPayload | null> {
  const token = cookies().get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}
