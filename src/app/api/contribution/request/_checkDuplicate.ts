import { Client } from "@notionhq/client";

export const checkDuplicate = async (twitterUrl: string): Promise<boolean> => {
  const databaseId = process.env.ACCOUNTLIST_DATABASE;
  if (!databaseId) throw new Error("ACCOUNTLIST_DATABASE is not set");

  const client = new Client({ auth: process.env.NOTION_API_KEY });
  const existing = await client.databases.query({
    database_id: databaseId,
    filter: {
      property: "Twitter/X アカウント",
      url: { equals: twitterUrl.trim() },
    },
  });
  return existing.results.length > 0;
};
