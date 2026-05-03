import { describe, it, expect } from "vitest";
import { isValidTwitterUrl, normalizeTwitterUrl, extractTwitterHandle } from "./twitterUrl";

describe("isValidTwitterUrl", () => {
  it("x.com URL を有効と判定する", () => {
    expect(isValidTwitterUrl("https://x.com/bluesky")).toBe(true);
  });

  it("twitter.com URL を有効と判定する", () => {
    expect(isValidTwitterUrl("https://twitter.com/bluesky")).toBe(true);
  });

  it("15文字のハンドルを有効と判定する", () => {
    expect(isValidTwitterUrl("https://x.com/abcdefghijklmno")).toBe(true);
  });

  it("16文字以上のハンドルを無効と判定する", () => {
    expect(isValidTwitterUrl("https://x.com/abcdefghijklmnop")).toBe(false);
  });

  it("スラッシュ末尾付きも有効と判定する", () => {
    expect(isValidTwitterUrl("https://x.com/bluesky/")).toBe(true);
  });

  it("空文字を無効と判定する", () => {
    expect(isValidTwitterUrl("")).toBe(false);
  });

  it("ランダム文字列を無効と判定する", () => {
    expect(isValidTwitterUrl("not-a-url")).toBe(false);
  });

  it("http:// を無効と判定する", () => {
    expect(isValidTwitterUrl("http://x.com/bluesky")).toBe(false);
  });

  it("前後スペースを除去して判定する", () => {
    expect(isValidTwitterUrl("  https://x.com/bluesky  ")).toBe(true);
  });
});

describe("normalizeTwitterUrl", () => {
  it("twitter.com を x.com に変換する", () => {
    expect(normalizeTwitterUrl("https://twitter.com/bluesky")).toBe("https://x.com/bluesky");
  });

  it("http:// を https:// に変換する", () => {
    expect(normalizeTwitterUrl("http://x.com/bluesky")).toBe("https://x.com/bluesky");
  });

  it("http://twitter.com を https://x.com に変換する", () => {
    expect(normalizeTwitterUrl("http://twitter.com/bluesky")).toBe("https://x.com/bluesky");
  });

  it("既に正規化済みの URL はそのまま返す", () => {
    expect(normalizeTwitterUrl("https://x.com/bluesky")).toBe("https://x.com/bluesky");
  });
});

describe("extractTwitterHandle", () => {
  it("x.com URL からハンドルを返す", () => {
    expect(extractTwitterHandle("https://x.com/bluesky")).toBe("bluesky");
  });

  it("twitter.com URL からハンドルを返す", () => {
    expect(extractTwitterHandle("https://twitter.com/bluesky")).toBe("bluesky");
  });

  it("http:// URL からもハンドルを返す", () => {
    expect(extractTwitterHandle("http://x.com/bluesky")).toBe("bluesky");
  });

  it("末尾スラッシュ付きでもハンドルを返す", () => {
    expect(extractTwitterHandle("https://x.com/bluesky/")).toBe("bluesky");
  });

  it("前後スペースを除去して処理する", () => {
    expect(extractTwitterHandle("  https://x.com/bluesky  ")).toBe("bluesky");
  });

  it("Bluesky URL は null を返す", () => {
    expect(extractTwitterHandle("https://bsky.app/profile/bluesky")).toBeNull();
  });

  it("空文字は null を返す", () => {
    expect(extractTwitterHandle("")).toBeNull();
  });
});
