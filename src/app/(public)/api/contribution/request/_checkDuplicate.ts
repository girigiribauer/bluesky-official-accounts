import { getNotionClient } from "src/lib/notionClient";

export const checkDuplicate = async (twitterUrl: string): Promise<boolean> => {
  const databaseId = process.env.ACCOUNTLIST_DATABASE;
  if (!databaseId) throw new Error("ACCOUNTLIST_DATABASE is not set");

  const existing = await getNotionClient().databases.query({
    database_id: databaseId,
    filter: {
      property: "Twitter/X アカウント",
      url: { equals: twitterUrl.trim() },
    },
  });
  return existing.results.length > 0;
};
