import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.local" });

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const entrySubmissions: Database["public"]["Tables"]["entry_submissions"]["Insert"][] = [
  {
    account_name: "[テスト] 公的機関アカウント",
    bluesky_did: "did:plc:test-seed-001",
    bluesky_handle: "test-public.bsky.social",
    twitter_url: "https://x.com/test_public_001",
    field_id: "public_infrastructure",
    transition_status: "dual_active",
    evidence: "公式サイト https://example.go.jp/ より確認",
  },
  {
    account_name: "[テスト] テックカンパニー",
    bluesky_did: "did:plc:test-seed-002",
    bluesky_handle: "test-tech.bsky.social",
    twitter_url: "https://x.com/test_tech_002",
    field_id: "tech",
    transition_status: "migrated",
    evidence: "公式Xプロフィールにリンクあり",
  },
  {
    account_name: "[テスト] エンタメ団体",
    bluesky_did: "did:plc:test-seed-003",
    bluesky_handle: "test-ent.bsky.social",
    twitter_url: null,
    field_id: "entertainment",
    transition_status: "migrated",
    evidence: null,
  },
];

const requestSubmissions: Database["public"]["Tables"]["request_submissions"]["Insert"][] = [
  {
    display_name: "[テスト] 来てほしい企業A",
    twitter_handle: "test_wants_001",
    field_id: "business",
  },
  {
    display_name: "[テスト] 来てほしい団体B",
    twitter_handle: "test_wants_002",
    field_id: "entertainment",
  },
];

(async () => {
  const { data: entries, error: entryError } = await supabase
    .from("entry_submissions")
    .insert(entrySubmissions)
    .select("id, account_name");

  if (entryError) {
    console.error("entry_submissions の挿入に失敗:", entryError.message);
    process.exit(1);
  }
  console.log(`entry_submissions: ${entries.length} 件追加`);
  entries.forEach((e) => console.log(`  - ${e.account_name} (${e.id})`));

  const { data: requests, error: requestError } = await supabase
    .from("request_submissions")
    .insert(requestSubmissions)
    .select("id, display_name");

  if (requestError) {
    console.error("request_submissions の挿入に失敗:", requestError.message);
    process.exit(1);
  }
  console.log(`request_submissions: ${requests.length} 件追加`);
  requests.forEach((r) => console.log(`  - ${r.display_name} (${r.id})`));
})();
