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
  createdTime: string;
  updatedTime: string;
};

export type CategorizedNotionItems = {
  title: string;
  criteria?: string;
  items: NotionItem[];
};
