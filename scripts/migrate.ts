import { Client } from "@notionhq/client";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// -------------------------------------------------------------------
// 旧カテゴリー → field_id マッピング
// 複数分野に跨るもの・内容依存のものは uncategorized にフォールバック
// -------------------------------------------------------------------
const CATEGORY_TO_FIELD_ID: Record<string, string> = {
  "政府・省庁・国会議員": "public_infrastructure",
  "地方自治体・地方議員": "public_infrastructure",
  "気象・災害": "public_infrastructure",
  "報道（マスメディア）": "public_infrastructure",
  "報道（個人・その他団体）": "public_infrastructure",
  "交通・乗り物": "public_infrastructure",
  "水族館・動植物園": "local",
  "観光": "local",
  "飲食": "local",
  "美術家・芸術家": "visual_arts",
  "写真・カメラ（個人・団体）": "visual_arts",
  "漫画家・イラストレーター": "visual_arts",
  "漫画作品": "visual_arts",
  "映像制作（個人・団体）": "video",
  "アニメ（作品）": "video",
  "アニメ（個人・団体）": "video",
  "テレビ番組・実写映画": "video",
  "ゲーム（個人・団体）": "games",
  "おもちゃ": "games",
  "キャラクター・マスコット": "games",
  "音楽（個人・団体）": "music",
  "声優": "music",
  "ラジオ番組・その他放送": "music",
  "タレント・モデル": "entertainment",
  "配信系": "entertainment",
  "小説家・作家": "publishing",
  "出版・書店": "publishing",
  "テクノロジー（個人・団体・技術領域）": "tech",
  "美容・ファッション": "fashion",
  "家具・インテリア": "fashion",
  "雑貨・インテリア": "fashion",
  "スポーツ": "sports",
  "文房具・事務用品": "lifestyle",
  "動物カフェ・いきものアカウント": "lifestyle",
  "神社仏閣・宗教": "lifestyle",
  // 内容依存・複数候補 → uncategorized
  "権利・社会": "uncategorized",
  "福祉・ボランティア": "uncategorized",
  "教育機関": "uncategorized",
  "学者・研究者・科学者": "uncategorized",
  "学生活動": "uncategorized",
  "ネットメディア": "uncategorized",
  "博物館・美術館・展覧会": "uncategorized",
  "同人活動（個人・団体）": "uncategorized",
  "医療・ヘルスケア（個人・団体）": "uncategorized",
  "ネットサービス": "uncategorized",
  "その他著名人": "uncategorized",
  "その他企業・団体": "uncategorized",
  "その他サービス・作品": "uncategorized",
};

const TWITTER_URL_PREFIX = "https://x.com/";
const TWITTER_COM_PREFIX = "https://twitter.com/";
const BSKY_URL_PREFIX = "https://bsky.app/profile/";

function extractTwitterHandle(url: string): string | null {
  if (url.startsWith(TWITTER_URL_PREFIX)) {
    return url.slice(TWITTER_URL_PREFIX.length).replace(/\/$/, "") || null;
  }
  if (url.startsWith(TWITTER_COM_PREFIX)) {
    return url.slice(TWITTER_COM_PREFIX.length).replace(/\/$/, "") || null;
  }
  return null;
}

function extractBlueskyHandle(url: string): string | null {
  if (!url.startsWith(BSKY_URL_PREFIX)) return null;
  return url.slice(BSKY_URL_PREFIX.length).replace(/\/$/, "") || null;
}

async function fetchAllPages(
  client: Client,
  databaseID: string
): Promise<any[]> {
  const pages: any[] = [];
  let cursor: string | undefined = undefined;

  do {
    if (cursor) await new Promise((r) => setTimeout(r, 700));
    const res = await client.databases.query({
      database_id: databaseID,
      page_size: 100,
      start_cursor: cursor,
      in_trash: false,
      filter: { property: "公開", checkbox: { equals: true } },
    });
    pages.push(...res.results);
    console.log(`fetched ${pages.length} pages...`);
    cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined;
  } while (cursor);

  return pages;
}

(async () => {
  dotenv.config({ path: "./.env.local" });

  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const databaseID = process.env.ACCOUNTLIST_DATABASE;
  if (!databaseID) throw new Error("ACCOUNTLIST_DATABASE is not set");

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("SUPABASE_URL or SUPABASE_SECRET_KEY is not set");
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  const pages = await fetchAllPages(notion, databaseID);
  console.log(`\ntotal: ${pages.length} records\n`);

  let entriesInserted = 0;
  let requestsInserted = 0;
  let warnings = 0;

  for (const page of pages) {
    const notionPageId: string = page.id;
    const name: string = page.properties["名前"]?.title[0]?.plain_text ?? "";
    const category: string = page.properties["分類"]?.select?.name ?? "";
    const transitionStatus: string =
      page.properties["ステータス"]?.select?.name ?? "";
    const twitterUrl: string | null =
      page.properties["Twitter/X アカウント"]?.url ?? null;
    const blueskyUrl: string | null =
      page.properties["Bluesky アカウント"]?.url ?? null;
    const source: string =
      page.properties["根拠"]?.rich_text[0]?.plain_text ?? "";
    const did: string =
      page.properties["did"]?.rich_text[0]?.plain_text ?? "";
    const approvedAt: string | null = page.created_time ?? null;

    if (!twitterUrl) {
      console.warn(`[WARN] no Twitter URL (page: ${notionPageId}, name: ${name})`);
      warnings++;
    }

    const twitterHandle = twitterUrl ? extractTwitterHandle(twitterUrl) : null;
    if (twitterUrl && !twitterHandle) {
      console.warn(
        `[WARN] unexpected Twitter URL format: "${twitterUrl}" (page: ${notionPageId})`
      );
      warnings++;
    }

    // Bluesky URL なし → requests テーブル
    if (!blueskyUrl) {
      if (!twitterHandle) {
        console.warn(`[WARN] skipping request with no twitter handle (page: ${notionPageId})`);
        warnings++;
        continue;
      }

      const { error } = await supabase.from("requests").insert({
        twitter_handle: twitterHandle,
        display_name: name,
        submitted_by: null,
      });

      if (error) {
        if (error.code === "23505") {
          // unique constraint: 重複スキップ
          console.log(`[SKIP] duplicate request: ${twitterHandle}`);
        } else {
          console.error(`[ERROR] requests insert failed (${twitterHandle}):`, error.message);
          warnings++;
        }
      } else {
        requestsInserted++;
      }
      continue;
    }

    // Bluesky URL あり → entries テーブル
    const blueskyHandle = extractBlueskyHandle(blueskyUrl);
    if (!blueskyHandle) {
      console.warn(
        `[WARN] unexpected Bluesky URL format: "${blueskyUrl}" (page: ${notionPageId})`
      );
      warnings++;
      continue;
    }

    if (!did) {
      console.warn(
        `[WARN] DID not resolved yet for handle "${blueskyHandle}" (page: ${notionPageId}) — skipping`
      );
      warnings++;
      continue;
    }

    const fieldId = CATEGORY_TO_FIELD_ID[category] ?? "uncategorized";
    if (!CATEGORY_TO_FIELD_ID[category]) {
      console.warn(
        `[WARN] unknown category "${category}" → uncategorized (page: ${notionPageId})`
      );
      warnings++;
    }

    const { data: entry, error: entryError } = await supabase
      .from("entries")
      .insert({
        bluesky_did: did,
        bluesky_handle: blueskyHandle,
        twitter_handle: twitterHandle,
        display_name: name,
        transition_status: transitionStatus,
        status: "published",
        approved_at: approvedAt,
        submitted_by: null,
      })
      .select("id")
      .single();

    if (entryError) {
      if (entryError.code === "23505") {
        console.log(`[SKIP] duplicate entry: ${did}`);
      } else {
        console.error(`[ERROR] entries insert failed (${did}):`, entryError.message);
        warnings++;
      }
      continue;
    }

    const entryId = entry.id;

    // entry_fields
    await supabase.from("entry_fields").insert({
      entry_id: entryId,
      field_id: fieldId,
      classification_id: null,
    });

    // evidences（根拠あるもののみ）
    if (source) {
      await supabase.from("evidences").insert({
        entry_id: entryId,
        moderator_id: null,
        content: source,
      });
    }

    // activities
    await supabase.from("activities").insert({
      entry_id: entryId,
      moderator_id: null,
      action: "migrate",
      payload: { notion_page_id: notionPageId },
    });

    entriesInserted++;
  }

  console.log("\n--- done ---");
  console.log(`entries inserted:  ${entriesInserted}`);
  console.log(`requests inserted: ${requestsInserted}`);
  console.log(`warnings:          ${warnings}`);
})();