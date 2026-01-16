import { NotionItem } from "./Notion";

export type AccountList = {
  updatedTime: string;
  total: number;
  checkedTotal: number;
  customDomainAccounts: number;
  weeklyPostedAccounts: number;
  monthlyPostedAccounts: number;
  accounts: NotionItem[];
};
