export type NotionResponse = {
  items: NotionItem[];
  cursor: string | null;
};

export type NotionItem = {
  id: string;
  name: string;
  category: string;
  status: string;
  twitter: string;
  bluesky: string;
  updatedTime: string;
};
