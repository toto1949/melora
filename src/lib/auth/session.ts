import { cookies } from "next/headers";
import {
  createOrGetProfile,
  createSession,
  destroySession,
  getSessionUser,
} from "@/lib/db/repository";
import type { Profile } from "@/types";

export const SESSION_COOKIE = "melora_session";
export const GUEST_COOKIE = "melora_guest";

export async function getCurrentUser(): Promise<Profile | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  return getSessionUser(token);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireStaff() {
  const user = await requireUser();
  const staffRoles = ["super_admin", "support", "producer", "reviewer", "content_manager"];
  if (!staffRoles.includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}

export async function signInWithPassword(email: string, _password: string, name?: string) {
  // Local/dev auth store. Wire to Supabase Auth when credentials are present.
  void _password;
  const profile = await createOrGetProfile({
    email,
    fullName: name ?? null,
    role: email === "admin@melora.app" ? "super_admin" : "customer",
  });
  const token = await createSession(profile.id);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return profile;
}

export async function signOut() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await destroySession(token);
  jar.delete(SESSION_COOKIE);
}

export async function getGuestToken() {
  const jar = await cookies();
  return jar.get(GUEST_COOKIE)?.value ?? null;
}

export async function setGuestToken(token: string) {
  const jar = await cookies();
  jar.set(GUEST_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
