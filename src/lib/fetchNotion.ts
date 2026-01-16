import "server-only";

import { Client } from "@notionhq/client";
import { NotionItem } from "../models/Notion";
import { News } from "../models/News";
import { Category } from "src/models/Category";
import { AccountList } from "src/models/AccountList";
import { readFile } from "fs/promises";

export type FetchDataResponse = {
  updatedTime: string;
  items: NotionItem[];
};

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const fetchAccounts = async (): Promise<AccountList> => {
  console.log(
    `call src/lib/fetchAccounts ${process.cwd() + "/data/accounts.json"}`
  );
  let accounts: AccountList;
  try {
    accounts = JSON.parse(
      await readFile(process.cwd() + "/data/accounts.json", "utf-8")
    ) as unknown as AccountList;
  } catch (e) {
    accounts = {
      updatedTime: "",
      total: 0,
      checkedTotal: 0,
      customDomainAccounts: 0,
      weeklyPostedAccounts: 0,
      monthlyPostedAccounts: 0,
      accounts: [],
    };
  }

  // TODO: types
  return accounts;
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

export const fetchCategories = async (): Promise<Category[]> => {
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
