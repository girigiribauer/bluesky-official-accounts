import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.local" });

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const ENTRY_PER_BATCH = 6;
const REQUEST_PER_BATCH = 3;

(async () => {
  // 既存のテストデータ件数から今回のバッチ番号を決定
  const { count: entryCount } = await supabase
    .from("entry_submissions")
    .select("*", { count: "exact", head: true })
    .like("account_name", "[テスト]%");
  const { count: requestCount } = await supabase
    .from("request_submissions")
    .select("*", { count: "exact", head: true })
    .like("display_name", "[テスト]%");

  const batch = Math.max(
    Math.ceil((entryCount ?? 0) / ENTRY_PER_BATCH),
    Math.ceil((requestCount ?? 0) / REQUEST_PER_BATCH)
  ) + 1;
  const n = String(batch).padStart(3, "0");

  // entry_submissions: public_infrastructure 多め、tech・business 少なめ
  const entrySubmissions: Database["public"]["Tables"]["entry_submissions"]["Insert"][] = [
    {
      account_name: `[テスト] ${n} 公的機関A`,
      bluesky_did: `did:plc:test-${n}-e1`,
      bluesky_handle: `test-${n}-e1.bsky.social`,
      twitter_url: `https://x.com/test_${n}_e1`,
      field_id: "public_infrastructure",
      transition_status: "dual_active",
      evidence: "公式サイトより確認",
    },
    {
      account_name: `[テスト] ${n} 公的機関B`,
      bluesky_did: `did:plc:test-${n}-e2`,
      bluesky_handle: `test-${n}-e2.bsky.social`,
      twitter_url: `https://x.com/test_${n}_e2`,
      field_id: "public_infrastructure",
      transition_status: "migrated",
      evidence: "公式Xプロフィールにリンクあり",
    },
    {
      account_name: `[テスト] ${n} 公的機関C`,
      bluesky_did: `did:plc:test-${n}-e3`,
      bluesky_handle: `test-${n}-e3.bsky.social`,
      twitter_url: null,
      field_id: "public_infrastructure",
      transition_status: "account_created",
      evidence: null,
    },
    {
      account_name: `[テスト] ${n} テック企業A`,
      bluesky_did: `did:plc:test-${n}-e4`,
      bluesky_handle: `test-${n}-e4.bsky.social`,
      twitter_url: `https://x.com/test_${n}_e4`,
      field_id: "tech",
      transition_status: "migrated",
      evidence: "公式サイトより確認",
    },
    {
      account_name: `[テスト] ${n} テック企業B`,
      bluesky_did: `did:plc:test-${n}-e5`,
      bluesky_handle: `test-${n}-e5.bsky.social`,
      twitter_url: `https://x.com/test_${n}_e5`,
      field_id: "tech",
      transition_status: "dual_active",
      evidence: null,
    },
    {
      account_name: `[テスト] ${n} ビジネス`,
      bluesky_did: `did:plc:test-${n}-e6`,
      bluesky_handle: `test-${n}-e6.bsky.social`,
      twitter_url: `https://x.com/test_${n}_e6`,
      field_id: "business",
      transition_status: "account_created",
      evidence: null,
    },
  ];

  // request_submissions: entertainment 多め、visual_arts 少なめ
  const requestSubmissions: Database["public"]["Tables"]["request_submissions"]["Insert"][] = [
    {
      display_name: `[テスト] ${n} 芸能A`,
      twitter_handle: `test_${n}_r1`,
      field_id: "entertainment",
    },
    {
      display_name: `[テスト] ${n} 芸能B`,
      twitter_handle: `test_${n}_r2`,
      field_id: "entertainment",
    },
    {
      display_name: `[テスト] ${n} イラスト`,
      twitter_handle: `test_${n}_r3`,
      field_id: "visual_arts",
    },
  ];

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
