import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import { News } from "../src/models/News";
import { Category } from "../src/models/Category";
import type { Database } from "../src/types/database";
import dotenv from "dotenv";

dotenv.config({ path: "./.env.local" });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  throw new Error("SUPABASE_URL or SUPABASE_SECRET_KEY is not set");
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SECRET_KEY);

(async () => {
  if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
  }

  console.log("fetching news...");
  const { data: newsData, error: newsError } = await supabase
    .from("news")
    .select("id, title, published_at")
    .order("published_at", { ascending: false });

  if (newsError) throw new Error(`Supabase news query failed: ${newsError.message}`);

  const news: News[] = (newsData ?? []).map((row) => ({
    id: row.id,
    name: row.title,
    date: row.published_at,
  }));
  fs.writeFileSync("data/news.json", JSON.stringify(news, null, 2));
  console.log(`saved data/news.json (${news.length} items)`);

  console.log("fetching categories...");
  const { data: catData, error: catError } = await supabase
    .from("old_categories")
    .select("id, title, sort_order, criteria")
    .order("sort_order", { ascending: true });

  if (catError) throw new Error(`Supabase categories query failed: ${catError.message}`);

  const categories: Category[] = (catData ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    order: row.sort_order,
    criteria: row.criteria,
  }));
  fs.writeFileSync("data/categories.json", JSON.stringify(categories, null, 2));
  console.log(`saved data/categories.json (${categories.length} items)`);
})();
