"use server";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { redirect } from "next/navigation";
import {
  getOrder,
  getOrderByShareToken,
  updateOrderPrivacy,
  verifyOrderSharePassword,
} from "@/lib/db/repository";
import { getCurrentUser } from "@/lib/auth/session";
import { hashPassword } from "@/lib/security/password";
import { getEnv } from "@/lib/env";

const LISTEN_UNLOCK_COOKIE = "melora_listen_unlock";

async function listenUnlockSecret() {
  const env = getEnv();
  if (!env.LISTEN_TOKEN_SECRET && !env.USE_MOCK_PROVIDERS) {
    throw new Error("LISTEN_TOKEN_SECRET is not configured");
  }
  return new TextEncoder().encode(env.LISTEN_TOKEN_SECRET || "dev-listen-secret");
}

async function setListenUnlocked(orderId: string) {
  const token = await new SignJWT({ orderId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(await listenUnlockSecret());
  const jar = await cookies();
  jar.set(LISTEN_UNLOCK_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function isListenUnlocked(orderId: string) {
  const jar = await cookies();
  const token = jar.get(LISTEN_UNLOCK_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, await listenUnlockSecret());
    return payload.orderId === orderId;
  } catch {
    return false;
  }
}

export async function verifyListenPasswordAction(shareToken: string, formData: FormData) {
  const order = await getOrderByShareToken(shareToken);
  if (!order) redirect("/");

  const password = String(formData.get("password") || "");
  const ok = await verifyOrderSharePassword(order.id, password);
  if (!ok) {
    redirect(`/listen/${shareToken}?error=invalid_password`);
  }

  await setListenUnlocked(order.id);
  redirect(`/listen/${shareToken}`);
}

export type PrivacyState = { error: string } | null;

export async function updatePrivacyAction(orderId: string, _prev: PrivacyState, formData: FormData): Promise<PrivacyState> {
  const user = await getCurrentUser();
  const order = await getOrder(orderId);
  if (!order) return { error: "Order not found." };
  if (!user || (order.userId && user.id !== order.userId && user.role === "customer")) {
    return { error: "You do not have permission to update this order." };
  }

  const privacyMode = String(formData.get("privacyMode")) as
    | "private"
    | "password"
    | "unlisted"
    | "public";
  const giftRevealEnabled = formData.get("giftRevealEnabled") === "on";
  const sharePassword = String(formData.get("sharePassword") || "");

  let passwordHash: string | null | undefined;
  if (privacyMode === "password") {
    if (!sharePassword || sharePassword.length < 4) {
      return { error: "Share password must be at least 4 characters." };
    }
    passwordHash = await hashPassword(sharePassword);
  } else {
    passwordHash = null;
  }

  await updateOrderPrivacy(orderId, privacyMode, giftRevealEnabled, passwordHash);
  redirect(`/listen/${order.shareToken}`);
}
