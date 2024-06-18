import { TransitionStatus } from "./TransitionStatus";

export type NotionResponse = {
  items: NotionItem[];
  cursor: string | null;
};

export type NotionItem = {
  id: string;
  name: string;
  category: string;
  status: TransitionStatus;
  twitter: string;
  bluesky: string;
  updatedTime: string;
};

export type NotionItemsWithLabel = {
  label: string;
  items: NotionItem[];
};
