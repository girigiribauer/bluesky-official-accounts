import { describe, it, expect } from "vitest";
import { sortEvidences } from "./sortEvidences";

describe("sortEvidences", () => {
  it("created_at の新しい順に並び替える", () => {
    const evidences = [
      { id: "a", created_at: "2026-01-01T00:00:00Z" },
      { id: "b", created_at: "2026-03-01T00:00:00Z" },
      { id: "c", created_at: "2026-02-01T00:00:00Z" },
    ];
    const result = sortEvidences(evidences);
    expect(result.map((e) => e.id)).toEqual(["b", "c", "a"]);
  });

  it("created_at が null のものは末尾に置く", () => {
    const evidences = [
      { id: "a", created_at: null },
      { id: "b", created_at: "2026-03-01T00:00:00Z" },
      { id: "c", created_at: null },
    ];
    const result = sortEvidences(evidences);
    expect(result.map((e) => e.id)).toEqual(["b", "a", "c"]);
  });

  it("すべて null のとき、元の順序を維持する", () => {
    const evidences = [
      { id: "a", created_at: null },
      { id: "b", created_at: null },
    ];
    const result = sortEvidences(evidences);
    expect(result.map((e) => e.id)).toEqual(["a", "b"]);
  });

  it("元の配列を変更しない", () => {
    const evidences = [
      { id: "a", created_at: "2026-01-01T00:00:00Z" },
      { id: "b", created_at: "2026-03-01T00:00:00Z" },
    ];
    sortEvidences(evidences);
    expect(evidences[0].id).toBe("a");
  });

  it("空配列のとき、空配列を返す", () => {
    expect(sortEvidences([])).toEqual([]);
  });
});
