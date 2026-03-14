import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockQuery = vi.fn();
const mockCreate = vi.fn();

vi.mock("@notionhq/client", () => ({
  Client: vi.fn(function () {
    return {
      databases: { query: mockQuery },
      pages: { create: mockCreate },
    };
  }),
}));

vi.stubEnv("ACCOUNTLIST_DATABASE", "mock-db-id");
vi.stubEnv("NOTION_API_KEY", "mock-api-key");

const { POST } = await import("./route");

let ipCounter = 0;
const makeRequest = (body: unknown, ip?: string, origin?: string) =>
  new NextRequest("http://localhost/api/contribution/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip ?? `10.0.0.${++ipCounter}`,
      host: "localhost",
      ...(origin !== undefined && { origin }),
    },
    body: JSON.stringify(body),
  });

describe("POST /api/contribution/request", () => {
  beforeEach(() => {
    mockQuery.mockResolvedValue({ results: [] });
    mockCreate.mockResolvedValue({ id: "mock-page-id" });
  });

  it("正常な入力で200を返す", async () => {
    const res = await POST(makeRequest({
      twitterUrl: "https://x.com/bluesky",
      twitterName: "Bluesky",
      website: "",
    }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  it("ハニーポットが埋まっていたら400を返す", async () => {
    const res = await POST(makeRequest({
      twitterUrl: "https://x.com/bluesky",
      twitterName: "Bluesky",
      website: "filled",
    }));
    expect(res.status).toBe(400);
  });

  it("不正なURLフォーマットは400を返す", async () => {
    const res = await POST(makeRequest({
      twitterUrl: "https://bsky.app/profile/bluesky",
      twitterName: "Bluesky",
      website: "",
    }));
    expect(res.status).toBe(400);
  });

  it("twitterNameが空なら400を返す", async () => {
    const res = await POST(makeRequest({
      twitterUrl: "https://x.com/bluesky",
      twitterName: "",
      website: "",
    }));
    expect(res.status).toBe(400);
  });

  it("重複アカウントは409を返す", async () => {
    mockQuery.mockResolvedValueOnce({ results: [{ id: "existing" }] });
    const res = await POST(makeRequest({
      twitterUrl: "https://x.com/bluesky",
      twitterName: "Bluesky",
      website: "",
    }));
    expect(res.status).toBe(409);
  });

  it("Notion create が失敗したら500を返す", async () => {
    mockCreate.mockRejectedValueOnce(new Error("Notion error"));
    const res = await POST(makeRequest({
      twitterUrl: "https://x.com/bluesky",
      twitterName: "Bluesky",
      website: "",
    }));
    expect(res.status).toBe(500);
  });

  it("別オリジンからのリクエストは403を返す", async () => {
    const res = await POST(makeRequest({
      twitterUrl: "https://x.com/bluesky",
      twitterName: "Bluesky",
      website: "",
    }, undefined, "https://evil.example.com"));
    expect(res.status).toBe(403);
  });

  it("同一オリジンからのリクエストは通過する", async () => {
    const res = await POST(makeRequest({
      twitterUrl: "https://x.com/bluesky",
      twitterName: "Bluesky",
      website: "",
    }, undefined, "http://localhost"));
    expect(res.status).toBe(200);
  });
});
