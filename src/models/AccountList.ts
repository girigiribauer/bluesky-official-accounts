import { Account } from "./Account";

export type AccountList = {
  updatedTime: string;
  total: number;
  checkedTotal: number;
  customDomainAccounts: number;
  weeklyPostedAccounts: number;
  monthlyPostedAccounts: number;
  accounts: Account[];
};
