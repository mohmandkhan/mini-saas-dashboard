import { NextResponse } from "next/server";
import { ZodError } from "zod";

/** Standard JSON success response. */
export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/** Standard JSON error response. */
export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

/** Turn a thrown error into a consistent JSON error response. */
export function handleError(err: unknown) {
  if (err instanceof ZodError) {
    return fail("Validation failed", 422, err.flatten().fieldErrors);
  }
  console.error(err);
  return fail("Internal server error", 500);
}
