import "server-only";

import { Client } from "@notionhq/client";
import { NotionResponse, NotionItem } from "../models/Notion";
import { News } from "../models/News";
import { Category } from "src/models/Category";

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
  const databaseID = process.env.ACCOUNTLIST_DATABASE || "DEFAULT_DATABASE_ID";
  const notionResponse = await notion.databases.query({
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

  return await (await fetch(`http://localhost:3000/databaseMock.json`)).json();
  // return {
  //   updatedTime: new Date().toISOString(),
  //   items: categories.map((category, i) => ({
  //     id: `test_${i + 1}`,
  //     name: `${category}のテストアカウント`,
  //     category,
  //     status: "両方運用中",
  //     twitter: `@test_${i + 1}`,
  //     bluesky: "@test_${i+1}.bsky.social",
  //     source: "",
  //     createdTime: "2025-01-18 00:00:00",
  //     updatedTime: "2025-01-18 00:00:00",
  //   })),
  // };

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
  const databaseID = process.env.NEWS_DATABASE || "DEFAULT_DATABASE_ID";
  const notionResponse = await notion.databases.query({
    database_id: databaseID,
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

export const fetchCategory = async (): Promise<Category[]> => {
  const databaseID = process.env.CATEGORY_DATABASE || "DEFAULT_DATABASE_ID";
  const notionResponse = await notion.databases.query({
    database_id: databaseID,
    page_size: 100,
    sorts: [
      {
        property: "order",
        direction: "ascending",
      },
    ],
  });

  return notionResponse.results.map<Category>((result: any) => {
    const id = result?.id ?? "";
    const title =
      result?.properties["分類名"]?.title
        .map((a: any) => a.plain_text)
        .join("") ?? "";
    const order = result?.properties["order"]?.number;
    const criteria =
      result?.properties["掲載基準（公開されます）"]?.rich_text[0]
        ?.plain_text ?? "";

    return { id, title, order, criteria };
  });
};
