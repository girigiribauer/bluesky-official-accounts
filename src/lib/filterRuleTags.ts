import { FilterRuleSet } from "src/models/FilterRuleSet";

export type FilterRuleTag = {
  key: keyof FilterRuleSet;
  value: string;
};

export const buildFilterRuleTags = (
  filterRuleSet: FilterRuleSet | null
): FilterRuleTag[] => {
  if (!filterRuleSet) return [];

  const tags: FilterRuleTag[] = [];

  if (filterRuleSet.time === "New") {
    tags.push({ key: "time", value: "1週間以内の登録" });
  }
  if (filterRuleSet.time === "Update") {
    tags.push({ key: "time", value: "1週間以内の登録・変更" });
  }
  if (filterRuleSet.text !== "") {
    const labels = filterRuleSet.text
      .split(" ")
      .map((a) => `"${a}"`)
      .join(",");
    tags.push({ key: "text", value: `${labels}を含む` });
  }
  if (filterRuleSet.customDomain) {
    tags.push({ key: "customDomain", value: "カスタムドメイン" });
  }
  if (filterRuleSet.verified) {
    tags.push({ key: "verified", value: "確認済み" });
  }

  return tags;
};
