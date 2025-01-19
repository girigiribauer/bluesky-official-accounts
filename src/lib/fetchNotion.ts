import "server-only";

import { Client } from "@notionhq/client";
import { NotionResponse, NotionItem } from "../models/Notion";
import { News } from "../models/News";
import { Criteria } from "src/models/Criteria";

export type FetchDataResponse = {
  updatedTime: string;
  items: NotionItem[];
};

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const fetchAccountsOnce = async (
  cursor?: string | null
): Promise<NotionResponse> => {
  const databaseId = process.env.ACCOUNTLIST_DATABASE || "DEFAULT_DATABASE_ID";
  const notionResponse = await notion.databases.query({
    database_id: databaseId,
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
      const status = result.properties["ステータス"]?.select?.name ?? "";
      const twitter = result.properties["Twitter/X アカウント"]?.url;
      const bluesky = result.properties["Bluesky アカウント"]?.url;
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

export const fetchAccounts = async () => {
  const limit = 1_000_000;
  let allItems: NotionItem[] = [];
  let nextCursor: string | null = null;

  return {
    updatedTime: new Date().toISOString(),
    items: [
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `test_a${i}`,
        name: "テストアカウントa",
        category: "政府・省庁・国会議員",
        status: "両方運用中",
        twitter: "@testa",
        bluesky: "@testa.bsky.social",
        source:
          "テストアカウントaの根拠です\n\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です\nテストアカウントaの根拠です",
        createdTime: "2024-12-28 00:00:00",
        updatedTime: "2024-12-28 00:00:00",
      })),
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `test_b${i}`,
        name: "テストアカウントb",
        category: "地方自治体・地方議員",
        status: "未移行（未確認）",
        twitter: "@testb",
        bluesky: "@testb.bsky.social",
        source: "テストアカウントbの根拠です",
        createdTime: "2024-12-28 00:00:00",
        updatedTime: "2024-12-28 00:00:00",
      })),
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `test_c${i}`,
        name: "テストアカウントc",
        category: "報道（マスメディア）",
        status: "未移行（未確認）",
        twitter: "@testc",
        bluesky: "@testc.bsky.social",
        source: "テストアカウントcの根拠です",
        createdTime: "2024-12-28 00:00:00",
        updatedTime: "2024-12-28 00:00:00",
      })),
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `test_d${i}`,
        name: "テストアカウントd",
        category: "漫画家・イラストレーター",
        status: "未移行（未確認）",
        twitter: "@testd",
        bluesky: "@testd.bsky.social",
        source: "テストアカウントdの根拠です",
        createdTime: "2024-12-28 00:00:00",
        updatedTime: "2024-12-28 00:00:00",
      })),
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `test_e${i}`,
        name: "テストアカウントe",
        category: "小説家・作家",
        status: "両方運用中",
        twitter: "@teste",
        bluesky: "@teste.bsky.social",
        source: "テストアカウントeの根拠です",
        createdTime: "2024-12-28 00:00:00",
        updatedTime: "2024-12-28 00:00:00",
      })),
      {
        id: "test_z",
        name: "きてほしいテストアカウントz",
        category: "政府・省庁・国会議員",
        status: "未移行（未確認）",
        twitter: "@testz",
        bluesky: "",
        source: "テストアカウントzの根拠です",
        createdTime: "2024-12-28 00:00:00",
        updatedTime: "2024-12-28 00:00:00",
      },
    ] as NotionItem[],
  };

  try {
    do {
      if (nextCursor) {
        // 連続してリクエストを送ると弾かれるらしいのでちょっと待つ
        await new Promise((r) => setTimeout(r, 3000));
      }
      const { items, cursor } = await fetchAccountsOnce(nextCursor);
      allItems = allItems.concat(items);

      if (allItems.length >= limit) break;
      nextCursor = cursor;
    } while (nextCursor);

    return {
      updatedTime: new Date().toISOString(),
      items: allItems,
    };
  } catch (error) {
    console.error(error);
    throw new Error(`Notion Request failed: ${error}`);
  }
};

export const fetchNews = async (): Promise<News[]> => {
  const databaseId = process.env.NEWS_DATABASE || "DEFAULT_DATABASE_ID";
  const notionResponse = await notion.databases.query({
    database_id: databaseId,
    page_size: 100,
    sorts: [
      {
        property: "Date",
        direction: "descending",
      },
    ],
  });

  return notionResponse.results.map<News>((result: any) => {
    const id = result?.id ?? "";
    const name =
      result?.properties["Name"]?.title
        .map((a: any) => a.plain_text)
        .join("") ?? "";
    const date = result?.properties["Date"]?.date?.start ?? "";
    return { id, name, date };
  });
};

export const fetchCriteria = async (): Promise<Criteria[]> => {
  const databaseId = process.env.CRITERIA_DATABASE || "DEFAULT_DATABASE_ID";
  const notionResponse = await notion.databases.query({
    database_id: databaseId,
    page_size: 100,
  });

  return notionResponse.results.map<Criteria>((result: any) => {
    const id = result?.id ?? "";
    const category =
      result?.properties["分類名"]?.title
        .map((a: any) => a.plain_text)
        .join("") ?? "";
    const criteria =
      result?.properties["掲載基準（公開されます）"]?.rich_text[0]
        ?.plain_text ?? "";

    return { id, category, criteria };
  });
};
