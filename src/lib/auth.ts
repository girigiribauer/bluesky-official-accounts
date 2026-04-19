import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "src/types/database";

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

async function getModeratorByDid(did: string): Promise<Moderator | null> {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
  const { data } = await supabase
    .from("moderators")
    .select("id, did, handle, display_name, is_admin, created_at")
    .eq("did", did)
    .single();
  if (!data) return null;

  let avatar: string | null = null;
  try {
    const res = await fetch(
      `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${did}`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const profile = await res.json();
      avatar = profile.avatar ?? null;
    }
  } catch {
    // アバター取得失敗はフォールバック（アイコン表示）
  }

  return { ...data, avatar };
}

/**
 * 現在ログイン中のモデレーターを返す。
 * Cookie の moderator_did から DID を取得し、moderators テーブルを引く。
 * DID が moderators に登録されていなければ null を返す。
 */
export async function getCurrentModerator(): Promise<Moderator | null> {
  const cookieStore = cookies();
  const did = cookieStore.get(SESSION_COOKIE)?.value;
  if (!did) return null;
  return getModeratorByDid(did);
}

export async function logout(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE);
}
