import { Account } from "src/models/Account";
import { Category } from "src/models/Category";

export type CategoryGroup = {
  id: string;
  title: string;
  criteria: string;
  items: Account[];
  total: number;
};

export const groupAccountsByCategory = (
  items: Account[],
  categoryList: Category[]
): CategoryGroup[] =>
  categoryList
    .map(({ id, title, criteria }) => {
      const categorizedItems = items.filter((a) => a.category === title);
      return { id, title, criteria, items: categorizedItems, total: categorizedItems.length };
    })
    .filter((a) => a.total !== 0);
