// Simple single-admin auth for the class project.
// Password comes from .env (ADMIN_PASSWORD). The cookie holds a SHA-256 token derived from it.
// Uses Web Crypto so the same code runs in middleware (edge) and in route handlers (node).

export const ADMIN_COOKIE = "admin_session";

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "admin123";
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function sessionToken(): Promise<string> {
  return sha256Hex(`casecraft-admin|${adminPassword()}|${process.env.ADMIN_SECRET ?? "casecraft-secret"}`);
}

export async function isValidSession(value?: string): Promise<boolean> {
  if (!value) return false;
  return value === (await sessionToken());
}
