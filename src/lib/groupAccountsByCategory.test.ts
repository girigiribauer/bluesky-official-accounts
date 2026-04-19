import { describe, it, expect } from "vitest";
import { groupAccountsByCategory } from "./groupAccountsByCategory";
import type { Account } from "src/models/Account";
import type { Category } from "src/models/Category";

const makeItem = (category: string): Account =>
  ({ category } as Account);

const categories: Category[] = [
  { id: "cat1", title: "政府・行政", order: 1, criteria: "" },
  { id: "cat2", title: "メディア", order: 2, criteria: "" },
  { id: "cat3", title: "スポーツ", order: 3, criteria: "" },
];

describe("groupAccountsByCategory", () => {
  it("カテゴリ別にアイテムをグループ化する", () => {
    const items = [makeItem("政府・行政"), makeItem("メディア"), makeItem("政府・行政")];
    const result = groupAccountsByCategory(items, categories);
    const gov = result.find((g) => g.title === "政府・行政");
    expect(gov?.total).toBe(2);
    expect(gov?.items).toHaveLength(2);
  });

  it("アイテムが0件のカテゴリは除外する", () => {
    const items = [makeItem("政府・行政")];
    const result = groupAccountsByCategory(items, categories);
    expect(result.find((g) => g.title === "メディア")).toBeUndefined();
    expect(result.find((g) => g.title === "スポーツ")).toBeUndefined();
  });

  it("categoryList の順序を維持する", () => {
    const items = [makeItem("メディア"), makeItem("政府・行政")];
    const result = groupAccountsByCategory(items, categories);
    expect(result[0].title).toBe("政府・行政");
    expect(result[1].title).toBe("メディア");
  });

  it("空のアイテムリストのとき空配列を返す", () => {
    expect(groupAccountsByCategory([], categories)).toEqual([]);
  });

  it("空のカテゴリリストのとき空配列を返す", () => {
    expect(groupAccountsByCategory([makeItem("政府・行政")], [])).toEqual([]);
  });
});
