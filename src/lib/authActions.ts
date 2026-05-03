"use server";

import { logout, SESSION_COOKIE } from "src/lib/auth";
import { getOAuthClient } from "src/lib/oauthClient";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const PROTECTED_PATHS = ["/moderation_beta"];

export async function logoutAction(formData: FormData) {
  const cookieStore = await cookies();
  const did = cookieStore.get(SESSION_COOKIE)?.value;

  if (did) {
    const client = await getOAuthClient();
    await client.revoke(did).catch(() => {});
  }

  await logout();
  const returnTo = formData.get("returnTo");
  const isProtected =
    typeof returnTo === "string" &&
    PROTECTED_PATHS.some((p) => returnTo.startsWith(p));
  redirect(isProtected || typeof returnTo !== "string" ? "/" : returnTo);
}
