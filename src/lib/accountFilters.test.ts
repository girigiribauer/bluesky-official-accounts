import { describe, it, expect } from "vitest";
import { timeFilter, textFilter, customDomainFilter, verifiedFilter } from "./accountFilters";
import { Account } from "src/models/Account";
import { FilterRuleSet } from "src/models/FilterRuleSet";

const baseRules: FilterRuleSet = {
  time: "None",
  text: "",
  customDomain: false,
  verified: false,
};

const item = (overrides: Partial<Account> = {}): Account => ({
  id: "1",
  name: "テストアカウント",
  category: "IT・テック・Web",
  status: "dual_active",
  twitter: "https://x.com/test",
  bluesky: "https://bsky.app/profile/test.bsky.social",
  source: "",
  createdTime: new Date(0).toISOString(),
  updatedTime: new Date(0).toISOString(),
  ...overrides,
});

const NOW = new Date("2024-01-15").valueOf();
const ONE_WEEK_AGO = NOW - 1000 * 60 * 60 * 24 * 7;

describe("timeFilter", () => {
  it("None のとき全件返す", () => {
    const items = [item(), item({ id: "2" })];
    expect(timeFilter(items, { ...baseRules, time: "None" }, ONE_WEEK_AGO)).toHaveLength(2);
  });

  it("New: 1週間以内に作成されたものだけ返す", () => {
    const recent = item({ createdTime: new Date(NOW - 1000).toISOString() });
    const old = item({ id: "2", createdTime: new Date(0).toISOString() });
    const result = timeFilter([recent, old], { ...baseRules, time: "New" }, ONE_WEEK_AGO);
    expect(result).toEqual([recent]);
  });

  it("Update: 1週間以内に更新されたものだけ返す", () => {
    const recent = item({ updatedTime: new Date(NOW - 1000).toISOString() });
    const old = item({ id: "2", updatedTime: new Date(0).toISOString() });
    const result = timeFilter([recent, old], { ...baseRules, time: "Update" }, ONE_WEEK_AGO);
    expect(result).toEqual([recent]);
  });
});

describe("textFilter", () => {
  it("text が空なら全件返す", () => {
    const items = [item(), item({ id: "2" })];
    expect(textFilter(items, baseRules)).toHaveLength(2);
  });

  it("name に一致するものを返す", () => {
    const a = item({ name: "Bluesky公式" });
    const b = item({ id: "2", name: "無関係" });
    expect(textFilter([a, b], { ...baseRules, text: "bluesky" })).toEqual([a]);
  });

  it("twitter に一致するものを返す", () => {
    const a = item({ twitter: "https://x.com/bluesky" });
    const b = item({ id: "2", twitter: "https://x.com/other" });
    expect(textFilter([a, b], { ...baseRules, text: "bluesky" })).toEqual([a]);
  });

  it("スペース区切りの複数ワードはOR検索", () => {
    const a = item({ name: "Bluesky公式" });
    const b = item({ id: "2", name: "Twitter公式" });
    const c = item({ id: "3", name: "無関係" });
    expect(textFilter([a, b, c], { ...baseRules, text: "bluesky twitter" })).toEqual([a, b]);
  });
});

describe("customDomainFilter", () => {
  it("false なら全件返す", () => {
    const items = [item(), item({ id: "2" })];
    expect(customDomainFilter(items, baseRules)).toHaveLength(2);
  });

  it("true のときカスタムドメインのみ返す", () => {
    const custom = item({ bluesky: "https://bsky.app/profile/custom.example.com" });
    const standard = item({ id: "2", bluesky: "https://bsky.app/profile/user.bsky.social" });
    const result = customDomainFilter([custom, standard], { ...baseRules, customDomain: true });
    expect(result).toEqual([custom]);
  });
});

describe("verifiedFilter", () => {
  it("false なら全件返す", () => {
    const items = [item(), item({ id: "2", status: "not_migrated" })];
    expect(verifiedFilter(items, baseRules)).toHaveLength(2);
  });

  it("true のとき未確認を除外する", () => {
    const verified = item({ status: "dual_active" });
    const unverified = item({ id: "2", status: "not_migrated" });
    const result = verifiedFilter([verified, unverified], { ...baseRules, verified: true });
    expect(result).toEqual([verified]);
  });
});
