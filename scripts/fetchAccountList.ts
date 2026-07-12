import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import { Account, AccountField } from "../src/models/Account";
import { AccountList } from "../src/models/AccountList";
import type { Database } from "../src/types/database";
import type { TransitionStatus } from "../src/models/TransitionStatus";
import { sortEvidences } from "../src/lib/sortEvidences";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.local" });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  throw new Error("SUPABASE_URL or SUPABASE_SECRET_KEY is not set");
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SECRET_KEY);

async function fetchAllPages<T>(
  query: () => ReturnType<typeof supabase.from>["select"],
  pageSize = 1000
): Promise<T[]> {
  const all: T[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await (query() as any).range(from, from + pageSize - 1);
    if (error) throw new Error(`Supabase query failed: ${error.message}`);
    all.push(...(data ?? []));
    if ((data ?? []).length < pageSize) break;
    from += pageSize;
  }
  return all;
}

// account_fields（分野割り当て）を fields / classifications と一緒に取得する共通の select 断片。
const ACCOUNT_FIELDS_SELECT =
  "account_fields(field_id, classification_id, fields(id, label), classifications(id, name))";

// PostgREST の埋め込みは to-one が object、to-many が array で返る。両方に耐える正規化。
const one = <T>(v: T | T[] | null | undefined): T | null =>
  Array.isArray(v) ? (v[0] ?? null) : (v ?? null);

type AccountFieldRow = {
  field_id: string;
  classification_id: string | null;
  fields: { id: string; label: string } | { id: string; label: string }[] | null;
  classifications: { id: string; name: string } | { id: string; name: string }[] | null;
};

const mapAccountFields = (rows: AccountFieldRow[] | null | undefined): AccountField[] =>
  (rows ?? []).map((af) => {
    const field = one(af.fields);
    const classification = one(af.classifications);
    return {
      fieldId: af.field_id,
      fieldLabel: field?.label ?? "",
      classificationId: af.classification_id ?? null,
      classificationName: classification?.name ?? null,
    };
  });

(async () => {
  const now = new Date();
  const updatedTime = now.toISOString();

  // entries テーブル（Bluesky 登録済みアカウント）
  console.log("fetching entries...");
  type EntryRow =
    Pick<Database["public"]["Tables"]["entries"]["Row"], "id" | "bluesky_handle" | "twitter_handle" | "transition_status" | "created_at" | "updated_at"> & {
      accounts:
        | (Pick<Database["public"]["Tables"]["accounts"]["Row"], "display_name"> & {
            account_fields: AccountFieldRow[];
            evidences: Pick<Database["public"]["Tables"]["evidences"]["Row"], "content" | "created_at">[];
          })
        | null;
    };

  const entryRows = await fetchAllPages<EntryRow>(
    () => supabase.from("entries").select(`id, bluesky_handle, twitter_handle, transition_status, created_at, updated_at, accounts(display_name, ${ACCOUNT_FIELDS_SELECT}, evidences(content, created_at))`)
  );

  const entryAccounts: Account[] = entryRows.map((row) => {
    const account = Array.isArray(row.accounts) ? row.accounts[0] : row.accounts;
    const evidences: Pick<Database["public"]["Tables"]["evidences"]["Row"], "content" | "created_at">[] = account?.evidences ?? [];
    const latestEvidence = sortEvidences(evidences).at(0) ?? null;
    return {
      id: row.id,
      name: account?.display_name ?? "",
      status: (row.transition_status ?? "unknown") as TransitionStatus,
      twitter: row.twitter_handle ? `https://x.com/${row.twitter_handle}` : "",
      bluesky: row.bluesky_handle ? `https://bsky.app/profile/${row.bluesky_handle}` : "",
      source: latestEvidence?.content ?? "",
      createdTime: row.created_at,
      updatedTime: row.updated_at,
      fields: mapAccountFields(account?.account_fields),
    };
  });

  // requests テーブル（来てほしいアカウント）
  console.log("fetching requests...");
  type RequestRow =
    Pick<Database["public"]["Tables"]["requests"]["Row"], "id" | "twitter_handle" | "created_at"> & {
      accounts:
        | (Pick<Database["public"]["Tables"]["accounts"]["Row"], "display_name"> & {
            account_fields: AccountFieldRow[];
            evidences: Pick<Database["public"]["Tables"]["evidences"]["Row"], "content" | "created_at">[];
          })
        | null;
    };

  const requestRows = await fetchAllPages<RequestRow>(
    () => supabase.from("requests").select(`id, twitter_handle, created_at, accounts(display_name, ${ACCOUNT_FIELDS_SELECT}, evidences(content, created_at))`)
  );

  const requestAccounts: Account[] = requestRows.map((row) => {
    const account = Array.isArray(row.accounts) ? row.accounts[0] : row.accounts;
    const evidences: Pick<Database["public"]["Tables"]["evidences"]["Row"], "content" | "created_at">[] = account?.evidences ?? [];
    const latestEvidence = sortEvidences(evidences).at(0) ?? null;
    return {
      id: row.id,
      name: account?.display_name ?? "",
      status: "not_migrated" as TransitionStatus,
      twitter: row.twitter_handle ? `https://x.com/${row.twitter_handle}` : "",
      bluesky: "",
      source: latestEvidence?.content ?? "",
      createdTime: row.created_at,
      updatedTime: row.created_at,
      fields: mapAccountFields(account?.account_fields),
    };
  });

  const accounts: Account[] = [...entryAccounts, ...requestAccounts].sort(
    (a, b) => a.name.localeCompare(b.name, "ja")
  );

  const total = accounts.length;
  const checkedTotal = accounts.filter(
    (a) => a.status !== "not_migrated" && a.status !== "unverified" && a.status !== "unknown"
  ).length;
  const customDomainAccounts = accounts.filter(
    (a) =>
      a.bluesky !== "" &&
      !a.bluesky.replace(".bsky.social/", ".bsky.social").endsWith(".bsky.social")
  ).length;
  const oneWeekAgo = now.valueOf() - 1000 * 60 * 60 * 24 * 7;
  const oneMonthAgo = now.valueOf() - 1000 * 60 * 60 * 24 * 31;
  const weeklyPostedAccounts = accounts.filter(
    (a) => new Date(a.createdTime).valueOf() >= oneWeekAgo
  ).length;
  const monthlyPostedAccounts = accounts.filter(
    (a) => new Date(a.createdTime).valueOf() >= oneMonthAgo
  ).length;

  const accountList: AccountList = {
    updatedTime,
    total,
    checkedTotal,
    customDomainAccounts,
    weeklyPostedAccounts,
    monthlyPostedAccounts,
    accounts,
  };

  if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
  }
  fs.writeFileSync("data/accounts.json", JSON.stringify(accountList, null, 2));
  console.log(`saved data/accounts.json (entries: ${entryAccounts.length}, requests: ${requestAccounts.length}, total: ${total})`);

  // --- 新分類の現物チェック（切り替え可否の判断材料） ---
  const noField = accounts.filter((a) => (a.fields?.length ?? 0) === 0);
  const undecidedClassification = accounts.filter((a) =>
    (a.fields ?? []).some((f) => f.classificationId === null)
  );
  const multiField = accounts.filter((a) => (a.fields?.length ?? 0) > 1);

  const byField = new Map<string, number>();
  accounts.forEach((a) =>
    (a.fields ?? []).forEach((f) => {
      const key = `${f.fieldId} (${f.fieldLabel})`;
      byField.set(key, (byField.get(key) ?? 0) + 1);
    })
  );

  console.log("\n--- 新分類カバレッジ ---");
  console.log(`未分野（fields が空）        : ${noField.length} / ${total}`);
  console.log(`分類未定を含む（field有・分類null）: ${undecidedClassification.length}`);
  console.log(`複数分野に所属                : ${multiField.length}`);
  console.log("\n--- 分野別アカウント数（account_fields 単位）---");
  [...byField.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`  ${v.toString().padStart(4)}  ${k}`));
})();
