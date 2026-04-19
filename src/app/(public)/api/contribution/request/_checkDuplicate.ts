import { getSupabaseClient } from "src/lib/supabaseClient";

const TWITTER_URL_PREFIX = "https://x.com/";
const TWITTER_COM_PREFIX = "https://twitter.com/";

function extractTwitterHandle(url: string): string | null {
  if (url.startsWith(TWITTER_URL_PREFIX)) {
    return url.slice(TWITTER_URL_PREFIX.length).replace(/\/$/, "") || null;
  }
  if (url.startsWith(TWITTER_COM_PREFIX)) {
    return url.slice(TWITTER_COM_PREFIX.length).replace(/\/$/, "") || null;
  }
  return null;
}

export const checkDuplicate = async (twitterUrl: string): Promise<boolean> => {
  const handle = extractTwitterHandle(twitterUrl.trim());
  if (!handle) return false;

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

  return (requestCount ?? 0) > 0 || (entryCount ?? 0) > 0;
};
