import { Client } from "@notionhq/client";

let _client: Client | null = null;

export function getNotionClient(): Client {
  if (!_client) {
    _client = new Client({ auth: process.env.NOTION_API_KEY });
  }
  return _client;
}
