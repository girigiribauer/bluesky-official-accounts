import "server-only";

import { readFile } from "fs/promises";
import { News } from "../models/News";
import { AccountList } from "src/models/AccountList";

const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/girigiribauer/bluesky-official-accounts/data/data";

// data ブランチは毎時更新されるので、最大15分で本番へ反映されるようキャッシュする。
const REVALIDATE_SECONDS = 900;

// dev環境のみ: data/*.json があればそれを返す。
// 本番では必ず GitHub(data ブランチ) を見る（デプロイに紛れた古いローカルを読ませないため）。
const readLocalJson = async <T>(filename: string): Promise<T | null> => {
  if (process.env.NODE_ENV === "production") return null;
  try {
    const raw = await readFile(process.cwd() + `/data/${filename}`, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

// 本番環境: data ブランチの JSON を取得。fetch 自体の revalidate でキャッシュする。
// ここを unstable_cache で包まないこと。両者を重ねると再検証が壊れ、更新が凍る（過去の不具合）。
const fetchFromGitHub = async <T>(filename: string): Promise<T> => {
  const res = await fetch(`${GITHUB_RAW_BASE}/${filename}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`GitHub fetch failed: ${res.status}`);
  return res.json();
};

export const fetchAccounts = async (): Promise<AccountList> => {
  const local = await readLocalJson<AccountList>("accounts.json");
  if (local) return local;
  return fetchFromGitHub<AccountList>("accounts.json");
};

export const fetchNews = async (): Promise<News[]> => {
  const local = await readLocalJson<News[]>("news.json");
  if (local) return local;
  return fetchFromGitHub<News[]>("news.json");
};
