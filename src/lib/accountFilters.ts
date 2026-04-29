import { NotionItem } from "src/models/Notion";
import { FilterRuleSet } from "src/models/FilterRuleSet";

export const timeFilter = (
  items: NotionItem[],
  rules: FilterRuleSet,
  oneWeekAgo: number
): NotionItem[] => {
  switch (rules.time) {
    case "New":
      return items.filter((a) => {
        const d = new Date(a.createdTime);
        return !Number.isNaN(d.getTime()) && d.valueOf() >= oneWeekAgo;
      });
    case "Update":
      return items.filter((a) => {
        const d = new Date(a.updatedTime);
        return !Number.isNaN(d.getTime()) && d.valueOf() >= oneWeekAgo;
      });
    case "None":
      return items;
  }
};

export const textFilter = (
  items: NotionItem[],
  rules: FilterRuleSet
): NotionItem[] => {
  if (rules.text === "") return items;
  const words = rules.text.toLowerCase().split(" ");
  return items.filter((v) => {
    const target = `${v.name.toLowerCase()} ${v.twitter} ${v.bluesky}`;
    return words.some((word) => target.includes(word));
  });
};

export const customDomainFilter = (
  items: NotionItem[],
  rules: FilterRuleSet
): NotionItem[] => {
  if (!rules.customDomain) return items;
  return items.filter(
    (a) =>
      a.bluesky !== null &&
      !a.bluesky.replace(".bsky.social/", ".bsky.social").endsWith(".bsky.social")
  );
};

export const verifiedFilter = (
  items: NotionItem[],
  rules: FilterRuleSet
): NotionItem[] => {
  if (!rules.verified) return items;
  return items.filter((a) => a.status !== "not_migrated");
};

export const applyFilters = (
  items: NotionItem[],
  rules: FilterRuleSet,
  oneWeekAgo: number
): NotionItem[] =>
  [
    (i: NotionItem[]) => textFilter(i, rules),
    (i: NotionItem[]) => timeFilter(i, rules, oneWeekAgo),
    (i: NotionItem[]) => customDomainFilter(i, rules),
    (i: NotionItem[]) => verifiedFilter(i, rules),
  ].reduce((acc, f) => f(acc), items);
