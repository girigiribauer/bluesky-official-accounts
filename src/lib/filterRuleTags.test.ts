import { describe, it, expect } from "vitest";
import { buildFilterRuleTags } from "./filterRuleTags";

describe("buildFilterRuleTags", () => {
  it("null のとき空配列を返す", () => {
    expect(buildFilterRuleTags(null)).toEqual([]);
  });

  it("time=New のときタグを追加する", () => {
    const tags = buildFilterRuleTags({ time: "New", text: "", customDomain: false, verified: false });
    expect(tags).toContainEqual({ key: "time", value: "1週間以内の登録" });
  });

  it("time=Update のときタグを追加する", () => {
    const tags = buildFilterRuleTags({ time: "Update", text: "", customDomain: false, verified: false });
    expect(tags).toContainEqual({ key: "time", value: "1週間以内の登録・変更" });
  });

  it("text があるときタグを追加する", () => {
    const tags = buildFilterRuleTags({ time: "None" as const, text: "政府 公式", customDomain: false, verified: false });
    expect(tags).toContainEqual({ key: "text", value: '"政府","公式"を含む' });
  });

  it("customDomain=true のときタグを追加する", () => {
    const tags = buildFilterRuleTags({ time: "None" as const, text: "", customDomain: true, verified: false });
    expect(tags).toContainEqual({ key: "customDomain", value: "カスタムドメイン" });
  });

  it("verified=true のときタグを追加する", () => {
    const tags = buildFilterRuleTags({ time: "None" as const, text: "", customDomain: false, verified: true });
    expect(tags).toContainEqual({ key: "verified", value: "確認済み" });
  });

  it("条件が全て false のとき空配列を返す", () => {
    expect(buildFilterRuleTags({ time: "None" as const, text: "" as string, customDomain: false, verified: false })).toEqual([]);
  });
});
