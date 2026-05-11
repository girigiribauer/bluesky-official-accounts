import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getSupabaseClient } from "src/lib/supabaseClient";

export type Moderator = {
  id: string;
  did: string;
  handle: string;
  display_name: string;
  is_admin: boolean;
  avatar: string | null;
  created_at: string;
};

export const SESSION_COOKIE = "moderator_did";

const SEP = "~";

function getSecret(): string {
  const s = process.env.OAUTH_PRIVATE_KEY;
  if (s) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("OAUTH_PRIVATE_KEY is not set");
  }
  // ローカル開発用フォールバック（本番では到達しない）
  return "local-dev-cookie-secret";
}

export function signToken(did: string): string {
  const sig = createHmac("sha256", getSecret()).update(did).digest("base64url");
  return `${did}${SEP}${sig}`;
}

export function verifyToken(token: string): string | null {
  const idx = token.lastIndexOf(SEP);
  if (idx === -1) return null;
  const did = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = createHmac("sha256", getSecret()).update(did).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return did;
}

async function getModeratorByDid(did: string): Promise<Moderator | null> {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from("moderators")
    .select("id, did, handle, display_name, is_admin, avatar, created_at")
    .eq("did", did)
    .single();
  if (!data) return null;

  await supabase
    .from("moderators")
    .update({ last_active_at: new Date().toISOString() })
    .eq("did", did);

  return data;
}

export async function getCurrentModerator(): Promise<Moderator | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const did = verifyToken(token);
  if (!did) return null;
  return getModeratorByDid(did);
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
