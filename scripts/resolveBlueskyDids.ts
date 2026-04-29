import { Client } from "@notionhq/client";
import dotenv from "dotenv";

const BSKY_URL_PREFIX = "https://bsky.app/profile/";

function extractHandle(blueskyUrl: string): string | null {
  if (!blueskyUrl.startsWith(BSKY_URL_PREFIX)) return null;
  const handle = blueskyUrl.slice(BSKY_URL_PREFIX.length).replace(/\/$/, "");
  if (!handle) return null;
  return handle;
}

async function resolveHandleToDid(handle: string): Promise<string | null> {
  const url = `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(handle)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = (await res.json()) as { did?: string };
  return json.did ?? null;
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
      filter: {
        property: "公開",
        checkbox: {
          equals: true,
        },
      },
    });
    pages.push(...res.results);
    console.log(`fetched ${pages.length} pages so far`);
    cursor = res.has_more && res.next_cursor ? res.next_cursor : undefined;
  } while (cursor);

  return pages;
}

(async () => {
  dotenv.config({ path: "./.env.local" });

  const client = new Client({ auth: process.env.NOTION_API_KEY });
  const databaseID = process.env.ACCOUNTLIST_DATABASE;
  if (!databaseID) throw new Error("ACCOUNTLIST_DATABASE is not set");

  const pages = await fetchAllPages(client, databaseID);
  console.log(`total: ${pages.length} pages`);

  let resolved = 0;
  let skippedAlready = 0;
  let skippedNoBluesky = 0;
  let warnings = 0;

  for (const [index, page] of pages.entries()) {
    const pageId = page.id;
    const blueskyUrl: string | null =
      page.properties["Bluesky アカウント"]?.url ?? null;
    const existingDid: string =
      page.properties["did"]?.rich_text?.[0]?.plain_text ?? "";

    if (!blueskyUrl) {
      skippedNoBluesky++;
      continue;
    }

    if (existingDid) {
      skippedAlready++;
      continue;
    }

    const handle = extractHandle(blueskyUrl);
    if (!handle) {
      console.warn(
        `[WARN] unexpected Bluesky URL format: "${blueskyUrl}" (page: ${pageId})`
      );
      warnings++;
      continue;
    }

    const did = await resolveHandleToDid(handle);
    if (!did) {
      console.warn(
        `[WARN] failed to resolve handle: "${handle}" (page: ${pageId})`
      );
      warnings++;
      continue;
    }

    await new Promise((r) => setTimeout(r, 350));
    await client.pages.update({
      page_id: pageId,
      properties: {
        did: {
          rich_text: [{ type: "text", text: { content: did } }],
        },
      },
    });

    console.log(`[${index + 1}/${pages.length}] resolved: ${handle} → ${did}`);
    resolved++;
  }

  console.log("\n--- done ---");
  console.log(`resolved:        ${resolved}`);
  console.log(`already had DID: ${skippedAlready}`);
  console.log(`no Bluesky URL:  ${skippedNoBluesky}`);
  console.log(`warnings:        ${warnings}`);
})();