import { describe, it, expect } from "vitest";
import { formatEvidenceMeta } from "./formatEvidenceMeta";

describe("formatEvidenceMeta", () => {
  it("moderator と created_at があるとき、日時とハンドルを含む文字列を返す", () => {
    const result = formatEvidenceMeta({
      created_at: "2026-04-09T14:47:26Z",
      moderators: { handle: "girigiribauer" },
    });
    // JST は UTC+9 なので 23:47:26
    expect(result).toBe("[2026/04/09 23:47:26] girigiribauer さん");
  });

  it("moderators が null のとき、旧管理からの移行表記を返す", () => {
    const result = formatEvidenceMeta({
      created_at: "2026-04-09T14:47:26Z",
      moderators: null,
    });
    expect(result).toBe("[旧管理から移行] 管理者さん");
  });

  it("created_at が null のとき、旧管理からの移行表記を返す", () => {
    const result = formatEvidenceMeta({
      created_at: null,
      moderators: { handle: "girigiribauer" },
    });
    expect(result).toBe("[旧管理から移行] 管理者さん");
  });

  it("どちらも null のとき、旧管理からの移行表記を返す", () => {
    const result = formatEvidenceMeta({
      created_at: null,
      moderators: null,
    });
    expect(result).toBe("[旧管理から移行] 管理者さん");
  });
});
