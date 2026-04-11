import { describe, it, expect } from "vitest";
import { formatDateTime } from "./formatDateTime";

describe("formatDateTime", () => {
  it("有効な ISO 文字列を日本時間でフォーマットする", () => {
    const result = formatDateTime("2024-01-15T10:30:00Z");
    // JST は UTC+9 なので 19:30:00 になる
    expect(result).toBe("2024/01/15 19:30:00");
  });

  it("無効な文字列のとき '-' を返す", () => {
    expect(formatDateTime("not-a-date")).toBe("-");
  });

  it("空文字のとき '-' を返す", () => {
    expect(formatDateTime("")).toBe("-");
  });
});
