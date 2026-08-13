import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getEnv, hasSupabase } from "@/lib/env";

export function getSupabaseAdmin() {
  const env = getEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase admin client not configured");
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getSupabaseServer() {
  const env = getEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Supabase server client not configured");
  }
  const jar = await cookies();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return jar.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => jar.set(name, value, options));
        } catch {
          // Called from a Server Component — the application proxy handles refresh.
        }
      },
    },
  });
}

export function trySupabaseAdmin() {
  if (!hasSupabase()) return null;
  try {
    return getSupabaseAdmin();
  } catch {
    return null;
  }
}
