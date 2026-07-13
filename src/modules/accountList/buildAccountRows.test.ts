import { describe, it, expect } from "vitest";
import { groupAccounts, buildRows, NO_FIELD } from "./buildAccountRows";
import type { Account, AccountField } from "src/models/Account";

const acc = (id: string, fields: AccountField[]): Account => ({
  id,
  name: id,
  status: "dual_active",
  twitter: "",
  bluesky: "",
  blueskyDid: "",
  source: "",
  createdTime: "",
  updatedTime: "",
  fields,
});

// fieldLabel は空にして FIELD_LABEL フォールバックも通す
const f = (
  fieldId: string,
  classificationId: string | null,
  name: string | null = null
): AccountField => ({ fieldId, fieldLabel: "", classificationId, classificationName: name });

describe("groupAccounts", () => {
  it("分野は fields.ts の sortOrder 順に並ぶ", () => {
    const g = groupAccounts([
      acc("a", [f("tech", "c1", "AI")]), // sortOrder 3
      acc("b", [f("public_infrastructure", "c2", "政府")]), // 1
      acc("c", [f("business", "c3", "企業")]), // 2
    ]);
    expect(g.fields.map((x) => x.fieldId)).toEqual([
      "public_infrastructure",
      "business",
      "tech",
    ]);
  });

  it("fieldLabel が空でもコード(FIELDS)からラベルを補完する", () => {
    const g = groupAccounts([acc("a", [f("tech", "c1", "AI")])]);
    expect(g.fields[0].label).toBe("IT・テック・Web");
  });

  it("分類は件数降順。ただし『未分類』(classificationId=null) は件数に関わらず末尾", () => {
    const g = groupAccounts([
      acc("1", [f("tech", "B", "B")]),
      acc("2", [f("tech", "B", "B")]),
      acc("3", [f("tech", "B", "B")]),
      acc("4", [f("tech", "A", "A")]),
      acc("5", [f("tech", null)]), // 未分類 2件
      acc("6", [f("tech", null)]),
    ]);
    const tech = g.fields.find((x) => x.fieldId === "tech")!;
    expect(tech.orderedClasses.map((c) => [c.name, c.accounts.length])).toEqual([
      ["B", 3],
      ["A", 1],
      ["未分類", 2], // 件数2でも末尾
    ]);
  });

  it("複数分野に属するアカウントは各分野の下に現れる", () => {
    const g = groupAccounts([
      acc("x", [f("tech", "c1", "AI"), f("business", "c2", "Brand")]),
    ]);
    expect(g.fields.map((x) => x.fieldId)).toEqual(["business", "tech"]);
    expect(g.fields.find((x) => x.fieldId === "tech")!.total).toBe(1);
    expect(g.fields.find((x) => x.fieldId === "business")!.total).toBe(1);
  });

  it("fields が空のアカウントは『未分野』へ入り、分野の末尾に置かれる", () => {
    const g = groupAccounts([acc("a", [f("tech", "c1", "AI")]), acc("b", [])]);
    expect(g.fields.map((x) => x.fieldId)).toEqual(["tech", NO_FIELD]);
    const nf = g.fields.find((x) => x.fieldId === NO_FIELD)!;
    expect(nf.label).toBe("未分野");
    expect(nf.orderedClasses[0].name).toBe("未分類");
  });
});

describe("buildRows", () => {
  const g = groupAccounts([acc("1", [f("tech", "A", "AI")])]);

  it("分野が閉じていれば分野見出しだけ", () => {
    expect(buildRows(g, new Set(), new Set()).map((r) => r.kind)).toEqual(["field"]);
  });

  it("分野を開くと分類見出しが出る（アカウントはまだ）", () => {
    expect(buildRows(g, new Set(["tech"]), new Set()).map((r) => r.kind)).toEqual([
      "field",
      "class",
    ]);
  });

  it("分類も開くとアカウント行まで展開される", () => {
    const rows = buildRows(g, new Set(["tech"]), new Set(["tech::A"]));
    expect(rows.map((r) => r.kind)).toEqual(["field", "class", "account"]);
  });

  it("分野見出しは分類数(classCount)を持つ", () => {
    const g2 = groupAccounts([
      acc("1", [f("tech", "B", "B")]),
      acc("2", [f("tech", "A", "A")]),
      acc("3", [f("tech", null)]), // 未分類
    ]);
    const rows = buildRows(g2, new Set(), new Set());
    const techRow = rows.find((r) => r.kind === "field" && r.fieldId === "tech");
    expect(techRow).toMatchObject({ classCount: 3, total: 3 });
  });
});
