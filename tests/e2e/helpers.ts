import { createHmac } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import type { Database } from "../../src/types/database";

config({ path: ".env.local" });

export const adminDb = () =>
  createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);

// src/lib/auth.ts の signToken と同じロジック。
// auth.ts は next/headers に依存しテスト外から import できないため複製している。
export const signSessionToken = (did: string): string => {
  const secret = process.env.OAUTH_PRIVATE_KEY ?? "local-dev-cookie-secret";
  const sig = createHmac("sha256", secret).update(did).digest("base64url");
  return `${did}~${sig}`;
};

export const SESSION_COOKIE = "moderator_did";
