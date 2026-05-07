import { Client } from "@notionhq/client";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

async function fetchAllNews(client: Client, databaseID: string): Promise<{ title: string; publishedAt: string }[]> {
  const pages: any[] = [];
  let cursor: string | undefined = undefined;

  do {
    if (cursor) await new Promise((r) => setTimeout(r, 700));
    const res = await client.databases.query({
      database_id: databaseID,
      page_size: 100,
      start_cursor: cursor,
      sorts: [{ property: "Date", direction: "ascending" }],
    });
    pages.push(...res.results);
    cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined;
  } while (cursor);

  return pages
    .map((page: any) => ({
      title: page.properties["Name"]?.title.map((a: any) => a.plain_text).join("") ?? "",
      publishedAt: page.properties["Date"]?.date?.start ?? "",
    }))
    .filter((item) => item.title && item.publishedAt);
}

(async () => {
  dotenv.config({ path: "./.env.production.local" });
  dotenv.config({ path: "./.env.local" });

  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const newsDatabaseID = process.env.NEWS_DATABASE;
  if (!newsDatabaseID) throw new Error("NEWS_DATABASE is not set");

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !supabaseKey) throw new Error("SUPABASE_URL or SUPABASE_SECRET_KEY is not set");

  const supabase = createClient(supabaseUrl, supabaseKey);

  const items = await fetchAllNews(notion, newsDatabaseID);
  console.log(`\ntotal: ${items.length} news items\n`);

  let inserted = 0;
  let warnings = 0;

  for (const item of items) {
    const { error } = await supabase.from("news").insert({
      title: item.title,
      published_at: item.publishedAt,
    });

    if (error) {
      console.error(`[ERROR] failed to insert "${item.title}":`, error.message);
      warnings++;
    } else {
      console.log(`[OK] ${item.publishedAt} ${item.title}`);
      inserted++;
    }
  }

  console.log("\n--- done ---");
  console.log(`inserted: ${inserted}`);
  console.log(`warnings: ${warnings}`);
})();
