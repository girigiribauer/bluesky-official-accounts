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

/**
 * 現在ログイン中のモデレーターを返す。
 * Cookie の moderator_did から DID を取得し、moderators テーブルを引く。
 * DID が moderators に登録されていなければ null を返す。
 */
export async function getCurrentModerator(): Promise<Moderator | null> {
  const cookieStore = await cookies();
  const did = cookieStore.get(SESSION_COOKIE)?.value;
  if (!did) return null;
  return getModeratorByDid(did);
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
