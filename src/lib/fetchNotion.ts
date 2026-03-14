import "server-only";

import { unstable_cache } from "next/cache";
import { readFile } from "fs/promises";
import { News } from "../models/News";
import { Category } from "src/models/Category";
import { AccountList } from "src/models/AccountList";

const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/girigiribauer/bluesky-official-accounts/data/data";

// dev環境: data/*.json があればそれを返す
const readLocalJson = async <T>(filename: string): Promise<T | null> => {
  try {
    const raw = await readFile(process.cwd() + `/data/${filename}`, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

// 本番環境: data ブランチの JSON を取得
const fetchFromGitHub = async <T>(filename: string): Promise<T> => {
  const res = await fetch(`${GITHUB_RAW_BASE}/${filename}`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`GitHub fetch failed: ${res.status}`);
  return res.json();
};

// ---------- accounts ----------

const _fetchAccountsCached = unstable_cache(
  () => fetchFromGitHub<AccountList>("accounts.json"),
  ["accounts"],
  { revalidate: 3600 }
);

export const fetchAccounts = async (): Promise<AccountList> => {
  const local = await readLocalJson<AccountList>("accounts.json");
  if (local) return local;
  return _fetchAccountsCached();
};

// ---------- news ----------

const _fetchNewsCached = unstable_cache(
  () => fetchFromGitHub<News[]>("news.json"),
  ["news"],
  { revalidate: 3600 }
);

export const fetchNews = async (): Promise<News[]> => {
  const local = await readLocalJson<News[]>("news.json");
  if (local) return local;
  return _fetchNewsCached();
};

// ---------- categories ----------

const _fetchCategoriesCached = unstable_cache(
  () => fetchFromGitHub<Category[]>("categories.json"),
  ["categories"],
  { revalidate: 3600 }
);

export const fetchCategories = async (): Promise<Category[]> => {
  const local = await readLocalJson<Category[]>("categories.json");
  if (local) return local;
  return _fetchCategoriesCached();
};
