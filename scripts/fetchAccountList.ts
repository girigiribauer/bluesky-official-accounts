import fs from "fs";
import { Client } from "@notionhq/client";
import { NotionItem, NotionResponse } from "../src/models/Notion";
import { AccountList } from "../src/models/AccountList";
import { TransitionStatus } from "../src/models/TransitionStatus";
import dotenv from "dotenv";

const NOTION_STATUS_MAP: Record<string, TransitionStatus> = {
  "未移行（未確認）": "not_migrated", // bluesky の有無で後から分離する
  "アカウント作成済": "account_created",
  "両方運用中": "dual_active",
  "Bluesky 完全移行": "migrated",
  "確認不能": "unverifiable",
};

function toTransitionStatus(notionStatus: string, bluesky: string | null): TransitionStatus {
  const mapped = NOTION_STATUS_MAP[notionStatus];
  if (!mapped) return "not_migrated";
  // 旧「未移行（未確認）」を bluesky の有無で分離
  if (mapped === "not_migrated" && bluesky) return "unverified";
  return mapped;
}

const fetchAccountsOnce = async (
  client: Client,
  databaseID: string,
  cursor?: string | null
): Promise<NotionResponse> => {
  const notionResponse = await client.databases.query({
    database_id: databaseID,
    page_size: 100, // 上限100
    start_cursor: cursor ?? undefined,
    sorts: [
      {
        property: "分類",
        direction: "ascending",
      },
      {
        property: "名前",
        direction: "ascending",
      },
    ],
    in_trash: false,
    filter: {
      property: "公開",
      checkbox: {
        equals: true,
      },
    },
  });

  const Response: NotionItem[] = await Promise.all(
    notionResponse.results.map(async (result: any) => {
      const id = result.id;
      const name = result.properties["名前"]?.title[0]?.plain_text ?? "";
      const category = result.properties["分類"]?.select?.name ?? "";
      const notionStatus = result.properties["ステータス"]?.select?.name ?? "";
      const twitter = result.properties["Twitter/X アカウント"]?.url;
      const bluesky = result.properties["Bluesky アカウント"]?.url;
      const status = toTransitionStatus(notionStatus, bluesky ?? null);
      const source = result.properties["根拠"]?.rich_text[0]?.plain_text ?? "";
      const createdTime = result.created_time;
      const updatedTime = result.last_edited_time;
      return {
        id,
        name,
        category,
        status,
        twitter,
        bluesky,
        source,
        createdTime,
        updatedTime,
      };
    })
  );

  return {
    items: Response,
    cursor: notionResponse.has_more ? notionResponse.next_cursor : null,
  };
};

const fetchAccountList = async (
  client: Client,
  databaseID: string
): Promise<AccountList> => {
  console.log("called fetchAccountList");
  const limit = 1_000_000;
  const now = new Date();
  const updatedTime = now.toISOString();

  let accounts: NotionItem[] = [];
  let nextCursor: string | null = null;

  try {
    do {
      if (nextCursor) {
        // Notion API は1秒間に3リクエストまで
        // https://developers.notion.com/reference/request-limits
        await new Promise((r) => setTimeout(r, 700));
      }
      const { items, cursor } = await fetchAccountsOnce(
        client,
        databaseID,
        nextCursor
      );
      accounts = accounts.concat(items);
      console.log(`called fetchAccountsOnce (${accounts.length})`);

      if (accounts.length >= limit) break;
      nextCursor = cursor;
    } while (nextCursor);

    const total = accounts.length;
    const checkedTotal = accounts.filter(
      (a) => a.status !== "not_migrated" && a.status !== "unverified"
    ).length;
    const customDomainAccounts = accounts.filter(
      (a) =>
        a.bluesky !== null &&
        !a.bluesky
          .replace(".bsky.social/", ".bsky.social")
          .endsWith(".bsky.social")
    ).length;
    const oneWeekAgo = now.valueOf() - 1000 * 60 * 60 * 24 * 7;
    const oneMonthAgo = now.valueOf() - 1000 * 60 * 60 * 24 * 31;
    const weeklyPostedAccounts = accounts.filter(
      (a) => new Date(a.createdTime).valueOf() >= oneWeekAgo
    ).length;
    const monthlyPostedAccounts = accounts.filter(
      (a) => new Date(a.createdTime).valueOf() >= oneMonthAgo
    ).length;

    return {
      updatedTime,
      total,
      checkedTotal,
      customDomainAccounts,
      weeklyPostedAccounts,
      monthlyPostedAccounts,
      accounts,
    };
  } catch (error) {
    console.error(error);
    throw new Error(`Notion Request failed: ${error}`);
  }
};

(async () => {
  dotenv.config({ path: "./.env.local" });

  const client = new Client({
    auth: process.env.NOTION_API_KEY,
  });
  const databaseID = process.env.ACCOUNTLIST_DATABASE;
  if (!databaseID) {
    throw "not found databaseID";
  }

  const accounts = await fetchAccountList(client, databaseID);
  if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
  }
  fs.writeFileSync("data/accounts.json", JSON.stringify(accounts, null, 2));
})();
