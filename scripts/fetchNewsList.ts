import fs from "fs";
import { Client } from "@notionhq/client";
import { News } from "../src/models/News";
import { Category } from "../src/models/Category";
import dotenv from "dotenv";

const fetchNews = async (client: Client, databaseID: string): Promise<News[]> => {
  const notionResponse = await client.databases.query({
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

const fetchCategories = async (client: Client, databaseID: string): Promise<Category[]> => {
  const notionResponse = await client.databases.query({
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

(async () => {
  dotenv.config({ path: "./.env.local" });

  const client = new Client({
    auth: process.env.NOTION_API_KEY,
  });

  if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
  }

  const newsDatabaseID = process.env.NEWS_DATABASE;
  if (!newsDatabaseID) {
    throw "not found NEWS_DATABASE";
  }
  console.log("fetching news...");
  const news = await fetchNews(client, newsDatabaseID);
  fs.writeFileSync("data/news.json", JSON.stringify(news, null, 2));
  console.log(`saved data/news.json (${news.length} items)`);

  const categoryDatabaseID = process.env.CATEGORY_DATABASE;
  if (!categoryDatabaseID) {
    throw "not found CATEGORY_DATABASE";
  }
  console.log("fetching categories...");
  const categories = await fetchCategories(client, categoryDatabaseID);
  fs.writeFileSync("data/categories.json", JSON.stringify(categories, null, 2));
  console.log(`saved data/categories.json (${categories.length} items)`);
})();
