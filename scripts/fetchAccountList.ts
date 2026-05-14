import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import { Account } from "../src/models/Account";
import { AccountList } from "../src/models/AccountList";
import type { Database } from "../src/types/database";
import type { TransitionStatus } from "../src/models/TransitionStatus";
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

(async () => {
  const now = new Date();
  const updatedTime = now.toISOString();

  // entries テーブル（Bluesky 登録済みアカウント）
  console.log("fetching entries...");
  type EntryRow =
    Pick<Database["public"]["Tables"]["entries"]["Row"], "id" | "bluesky_handle" | "twitter_handle" | "transition_status" | "created_at" | "updated_at"> & {
      accounts:
        | (Pick<Database["public"]["Tables"]["accounts"]["Row"], "display_name" | "old_category"> & {
            evidences: Pick<Database["public"]["Tables"]["evidences"]["Row"], "content">[];
          })
        | null;
    };

  const entryRows = await fetchAllPages<EntryRow>(
    () => supabase.from("entries").select("id, bluesky_handle, twitter_handle, transition_status, created_at, updated_at, accounts(display_name, old_category, evidences(content))")
  );

  const entryAccounts: Account[] = entryRows.map((row) => {
    const account = Array.isArray(row.accounts) ? row.accounts[0] : row.accounts;
    return {
      id: row.id,
      name: account?.display_name ?? "",
      category: account?.old_category ?? "",
      status: (row.transition_status ?? "unknown") as TransitionStatus,
      twitter: row.twitter_handle ? `https://x.com/${row.twitter_handle}` : "",
      bluesky: row.bluesky_handle ? `https://bsky.app/profile/${row.bluesky_handle}` : "",
      source: Array.isArray(account?.evidences) && account.evidences.length > 0
        ? account.evidences[0].content
        : "",
      createdTime: row.created_at,
      updatedTime: row.updated_at,
    };
  });

  // requests テーブル（来てほしいアカウント）
  console.log("fetching requests...");
  type RequestRow =
    Pick<Database["public"]["Tables"]["requests"]["Row"], "id" | "twitter_handle" | "created_at"> & {
      accounts:
        | (Pick<Database["public"]["Tables"]["accounts"]["Row"], "display_name" | "old_category"> & {
            evidences: Pick<Database["public"]["Tables"]["evidences"]["Row"], "content">[];
          })
        | null;
    };

  const requestRows = await fetchAllPages<RequestRow>(
    () => supabase.from("requests").select("id, twitter_handle, created_at, accounts(display_name, old_category, evidences(content))")
  );

  const requestAccounts: Account[] = requestRows.map((row) => {
    const account = Array.isArray(row.accounts) ? row.accounts[0] : row.accounts;
    return {
      id: row.id,
      name: account?.display_name ?? "",
      category: account?.old_category ?? "",
      status: "not_migrated" as TransitionStatus,
      twitter: row.twitter_handle ? `https://x.com/${row.twitter_handle}` : "",
      bluesky: "",
      source: Array.isArray(account?.evidences) && account.evidences.length > 0
        ? account.evidences[0].content
        : "",
      createdTime: row.created_at,
      updatedTime: row.created_at,
    };
  });

  const accounts: Account[] = [...entryAccounts, ...requestAccounts].sort(
    (a, b) =>
      a.category.localeCompare(b.category, "ja") ||
      a.name.localeCompare(b.name, "ja")
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
})();
