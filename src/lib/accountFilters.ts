import { Account } from "src/models/Account";
import { FilterRuleSet } from "src/models/FilterRuleSet";

export const timeFilter = (
  items: Account[],
  rules: FilterRuleSet,
  oneWeekAgo: number
): Account[] => {
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
  items: Account[],
  rules: FilterRuleSet
): Account[] => {
  if (rules.text === "") return items;
  const words = rules.text.toLowerCase().split(" ");
  return items.filter((v) => {
    const target = `${v.name.toLowerCase()} ${v.twitter} ${v.bluesky}`;
    return words.some((word) => target.includes(word));
  });
};

export const customDomainFilter = (
  items: Account[],
  rules: FilterRuleSet
): Account[] => {
  if (!rules.customDomain) return items;
  return items.filter(
    (a) =>
      a.bluesky !== null &&
      !a.bluesky.replace(".bsky.social/", ".bsky.social").endsWith(".bsky.social")
  );
};

export const verifiedFilter = (
  items: Account[],
  rules: FilterRuleSet
): Account[] => {
  if (!rules.verified) return items;
  return items.filter((a) => a.status !== "not_migrated");
};

export const applyFilters = (
  items: Account[],
  rules: FilterRuleSet,
  oneWeekAgo: number
): Account[] =>
  [
    (i: Account[]) => textFilter(i, rules),
    (i: Account[]) => timeFilter(i, rules, oneWeekAgo),
    (i: Account[]) => customDomainFilter(i, rules),
    (i: Account[]) => verifiedFilter(i, rules),
  ].reduce((acc, f) => f(acc), items);
