import "server-only";

import { Client } from "@notionhq/client";
import { unstable_cache } from "next/cache";
import { NotionResponse, NotionItem } from "../models/Notion";

export type FetchDataResponse = {
  updatedTime: string;
  items: NotionItem[];
};

const notion = new Client({
  auth: process.env.NEXT_PUBLIC_NOTION_API_KEY,
});

const query = async (databaseId: string, cursor?: string | null) => {
  console.log(`query called at ${new Date()}`);
  return await notion.databases.query({
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
};

const fetchNotionOnce = async (
  cursor?: string | null
): Promise<NotionResponse> => {
  console.log(`fetchNotionOnce called at ${new Date()}`);
  const databaseId = process.env.NEXT_PUBLIC_DB_URL || "DEFAULT_DATABASE_ID";
  const notionResponse = await query(databaseId, cursor);

  const Response: NotionItem[] = await Promise.all(
    notionResponse.results.map(async (result: any) => {
      const id = result.id;
      const name = result.properties["名前"]?.title[0]?.plain_text;
      const category = result.properties["分類"]?.select.name;
      const status = result.properties["ステータス"]?.select.name;
      const twitter = result.properties["Twitter/X アカウント"]?.url;
      const bluesky = result.properties["Bluesky アカウント"]?.url;
      const updatedTime = result.last_edited_time;
      return { id, name, category, status, twitter, bluesky, updatedTime };
    })
  );

  return {
    items: Response,
    cursor: notionResponse.has_more ? notionResponse.next_cursor : null,
  };
};

export const fetchNotion = async (limit: number) => {
  console.log(`fetchNotion called at ${new Date()}`);
  let allItems: NotionItem[] = [];
  let nextCursor: string | null = null;

  try {
    do {
      if (nextCursor) {
        // 連続してリクエストを送ると弾かれるらしいのでちょっと待つ
        await new Promise((r) => setTimeout(r, 3000));
      }
      const { items, cursor } = await fetchNotionOnce(nextCursor);
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
