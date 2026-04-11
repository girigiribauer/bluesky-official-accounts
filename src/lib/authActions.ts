"use server";

import { logout } from "src/lib/auth";
import { redirect } from "next/navigation";

const PROTECTED_PATHS = ["/moderation_beta"];

export async function logoutAction(formData: FormData) {
  await logout();
  const returnTo = formData.get("returnTo");
  const isProtected =
    typeof returnTo === "string" &&
    PROTECTED_PATHS.some((p) => returnTo.startsWith(p));
  redirect(isProtected || typeof returnTo !== "string" ? "/" : returnTo);
}
