import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "src/types/database";

export function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL or SUPABASE_SECRET_KEY is not set");
  }
  return createClient<Database>(url, key);
}
