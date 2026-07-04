import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.local" });

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

(async () => {
  // 申請段階のレコードを削除
  const { data: entrySubmissions, error: entrySubmissionError } = await supabase
    .from("entry_submissions")
    .delete()
    .like("account_name", "[テスト]%")
    .select("id, account_name");

  if (entrySubmissionError) {
    console.error("entry_submissions の削除に失敗:", entrySubmissionError.message);
    process.exit(1);
  }
  console.log(`entry_submissions: ${entrySubmissions.length} 件削除`);
  entrySubmissions.forEach((e) => console.log(`  - ${e.account_name} (${e.id})`));

  const { data: requestSubmissions, error: requestSubmissionError } = await supabase
    .from("request_submissions")
    .delete()
    .like("display_name", "[テスト]%")
    .select("id, display_name");

  if (requestSubmissionError) {
    console.error("request_submissions の削除に失敗:", requestSubmissionError.message);
    process.exit(1);
  }
  console.log(`request_submissions: ${requestSubmissions.length} 件削除`);
  requestSubmissions.forEach((r) => console.log(`  - ${r.display_name} (${r.id})`));

  // 承認済みのレコードを削除（accounts に紐づく requests・entries・account_fields・evidences も含む）
  const { data: accounts, error: accountsError } = await supabase
    .from("accounts")
    .select("id, display_name")
    .like("display_name", "[テスト]%");

  if (accountsError) {
    console.error("accounts の取得に失敗:", accountsError.message);
    process.exit(1);
  }

  if (accounts.length === 0) {
    console.log("accounts: 0 件削除");
  } else {
    const accountIds = accounts.map((a) => a.id);

    await supabase.from("evidences").delete().in("account_id", accountIds);
    await supabase.from("account_fields").delete().in("account_id", accountIds);
    await supabase.from("entries").delete().in("account_id", accountIds);
    await supabase.from("requests").delete().in("account_id", accountIds);

    const { error: deleteAccountsError } = await supabase
      .from("accounts")
      .delete()
      .in("id", accountIds);

    if (deleteAccountsError) {
      console.error("accounts の削除に失敗:", deleteAccountsError.message);
      process.exit(1);
    }

    console.log(`accounts: ${accounts.length} 件削除`);
    accounts.forEach((a) => console.log(`  - ${a.display_name} (${a.id})`));
  }
})();
