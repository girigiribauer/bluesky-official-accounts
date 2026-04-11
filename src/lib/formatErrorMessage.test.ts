import { describe, it, expect } from "vitest";
import { formatErrorMessage } from "./formatErrorMessage";

describe("formatErrorMessage", () => {
  it("AbortError のときタイムアウトメッセージを返す", () => {
    const err = new DOMException("aborted", "AbortError");
    expect(formatErrorMessage(err)).toBe("タイムアウトしました。時間をおいて再度お試しください。");
  });

  it("通常の Error のときそのメッセージを返す", () => {
    expect(formatErrorMessage(new Error("サーバーエラー"))).toBe("サーバーエラー");
  });

  it("Error でない値のときデフォルトメッセージを返す", () => {
    expect(formatErrorMessage("unexpected")).toBe("送信に失敗しました。時間をおいて再度お試しください。");
    expect(formatErrorMessage(null)).toBe("送信に失敗しました。時間をおいて再度お試しください。");
    expect(formatErrorMessage(undefined)).toBe("送信に失敗しました。時間をおいて再度お試しください。");
  });
});
