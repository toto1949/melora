import { cookies } from "next/headers";
import { getSupabaseServer } from "@/lib/db/client";
import {
  createOrGetProfile,
  getProfile,
} from "@/lib/db/repository";
import {
  createSession as mockCreateSession,
  destroySession as mockDestroySession,
  getSessionUser as mockGetSessionUser,
} from "@/lib/db/mock-repository";
import { hasSupabase } from "@/lib/env";
import type { Profile } from "@/types";

export const SESSION_COOKIE = "melora_session";
export const GUEST_COOKIE = "melora_guest";

export async function getCurrentUser(): Promise<Profile | null> {
  if (hasSupabase()) {
    try {
      const sb = await getSupabaseServer();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user?.email) return null;
      const profile = await getProfile(user.id);
      if (profile && !profile.deletedAt) return profile;
      return createOrGetProfile({
        id: user.id,
        email: user.email,
        fullName: (user.user_metadata?.full_name as string | undefined) ?? null,
      });
    } catch {
      return null;
    }
  }

  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  return mockGetSessionUser(token);
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

export async function signInWithPassword(email: string, password: string, name?: string) {
  if (hasSupabase()) {
    const sb = await getSupabaseServer();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return (
      (await getProfile(data.user.id)) ??
      (await createOrGetProfile({
        id: data.user.id,
        email: data.user.email!,
        fullName: name ?? (data.user.user_metadata?.full_name as string | undefined) ?? null,
      }))
    );
  }

  const profile = await createOrGetProfile({
    email,
    fullName: name ?? null,
    role: email === "admin@melora.app" ? "super_admin" : "customer",
  });
  const token = await mockCreateSession(profile.id);
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

export async function signUpWithPassword(email: string, password: string, name?: string) {
  if (hasSupabase()) {
    const sb = await getSupabaseServer();
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Sign up failed");
    return (
      (await getProfile(data.user.id)) ??
      (await createOrGetProfile({
        id: data.user.id,
        email: data.user.email!,
        fullName: name ?? null,
      }))
    );
  }

  return signInWithPassword(email, password, name);
}

export async function signOut() {
  if (hasSupabase()) {
    const sb = await getSupabaseServer();
    await sb.auth.signOut();
    return;
  }

  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await mockDestroySession(token);
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
