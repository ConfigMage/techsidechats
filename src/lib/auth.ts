import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "admin_session";
const SESSION_TOKEN = "authenticated";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME);
  return session?.value === SESSION_TOKEN;
}

export function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error("ADMIN_PASSWORD environment variable is not set");
    return false;
  }
  return password === adminPassword;
}

export function getSessionCookie() {
  return {
    name: ADMIN_COOKIE_NAME,
    value: SESSION_TOKEN,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  };
}

export function getLogoutCookie() {
  return {
    name: ADMIN_COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
  };
}
