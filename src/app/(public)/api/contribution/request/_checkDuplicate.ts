import { getSupabaseClient } from "src/lib/supabaseClient";
import { extractTwitterHandle } from "src/lib/twitterUrl";

export type DuplicateCheckResult = "none" | "entry" | "request";

export const checkDuplicate = async (twitterUrl: string): Promise<DuplicateCheckResult> => {
  const handle = extractTwitterHandle(twitterUrl.trim());
  if (!handle) return "none";

  const supabase = getSupabaseClient();

  const [{ count: requestCount }, { count: entryCount }] = await Promise.all([
    supabase
      .from("requests")
      .select("id", { count: "exact", head: true })
      .eq("twitter_handle", handle),
    supabase
      .from("entries")
      .select("id", { count: "exact", head: true })
      .eq("twitter_handle", handle),
  ]);

  if ((entryCount ?? 0) > 0) return "entry";
  if ((requestCount ?? 0) > 0) return "request";
  return "none";
};
