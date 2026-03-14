import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockQuery = vi.fn();

vi.mock("@notionhq/client", () => ({
  Client: vi.fn(function () {
    return {
      databases: { query: mockQuery },
    };
  }),
}));

vi.stubEnv("ACCOUNTLIST_DATABASE", "mock-db-id");
vi.stubEnv("NOTION_API_KEY", "mock-api-key");

const { GET } = await import("./route");

const makeRequest = (url?: string) => {
  const reqUrl = url !== undefined
    ? `http://localhost/api/contribution/request/check?url=${encodeURIComponent(url)}`
    : "http://localhost/api/contribution/request/check";
  return new NextRequest(reqUrl);
};

describe("GET /api/contribution/request/check", () => {
  beforeEach(() => {
    mockQuery.mockResolvedValue({ results: [] });
  });

  it("urlパラメーターがなければ400を返す", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
  });

  it("urlが空文字なら400を返す", async () => {
    const res = await GET(makeRequest(""));
    expect(res.status).toBe(400);
  });

  it("重複なしの場合は duplicate: false を返す", async () => {
    const res = await GET(makeRequest("https://x.com/bluesky"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.duplicate).toBe(false);
  });

  it("重複ありの場合は duplicate: true を返す", async () => {
    mockQuery.mockResolvedValueOnce({ results: [{ id: "existing-page" }] });
    const res = await GET(makeRequest("https://x.com/bluesky"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.duplicate).toBe(true);
  });

  it("Notionがエラーのとき500を返す", async () => {
    mockQuery.mockRejectedValueOnce(new Error("Notion error"));
    const res = await GET(makeRequest("https://x.com/bluesky"));
    expect(res.status).toBe(500);
  });
});
