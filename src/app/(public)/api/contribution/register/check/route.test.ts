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

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const { GET } = await import("./route");

const makeRequest = (actor?: string) => {
  const url = actor
    ? `http://localhost/api/contribution/register/check?actor=${encodeURIComponent(actor)}`
    : "http://localhost/api/contribution/register/check";
  return new NextRequest(url);
};

const mockProfile = {
  did: "did:plc:abc123",
  handle: "bsky.app",
  displayName: "Bluesky",
};

describe("GET /api/contribution/register/check", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockProfile,
    });
    mockQuery.mockResolvedValue({ results: [] });
  });

  it("actorパラメーターがなければ400を返す", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
  });

  it("actorが空文字なら400を返す", async () => {
    const res = await GET(makeRequest(""));
    expect(res.status).toBe(400);
  });

  it("新規アカウントは status: new を返す", async () => {
    const res = await GET(makeRequest("bsky.app"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("new");
    expect(json.did).toBe(mockProfile.did);
    expect(json.handle).toBe(mockProfile.handle);
    expect(json.displayName).toBe(mockProfile.displayName);
  });

  it("Bluesky APIが404を返した場合は status: invalid を返す", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
    const res = await GET(makeRequest("notfound.bsky.social"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("invalid");
  });

  it("Bluesky APIが400を返した場合は status: invalid を返す", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });
    const res = await GET(makeRequest("invalid-handle"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("invalid");
  });

  it("Bluesky APIがエラーのとき500を返す", async () => {
    mockFetch.mockRejectedValueOnce(new Error("network error"));
    const res = await GET(makeRequest("bsky.app"));
    expect(res.status).toBe(500);
  });

  it("Notionに既存レコードがある場合は status: registered を返す", async () => {
    mockQuery.mockResolvedValueOnce({
      results: [
        {
          id: "page-id",
          properties: {
            名前: { title: [{ plain_text: "Bluesky" }] },
            分類: { select: { name: "テクノロジー" } },
            根拠: { rich_text: [{ plain_text: "https://example.com" }] },
            "Twitter/X アカウント": { url: "https://x.com/bluesky" },
            ステータス: { select: { name: "両方運用中" } },
          },
        },
      ],
    });
    const res = await GET(makeRequest("bsky.app"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("registered");
    expect(json.existing.name).toBe("Bluesky");
    expect(json.existing.status).toBe("両方運用中");
  });

  it("Notionがエラーのとき500を返す", async () => {
    mockQuery.mockRejectedValueOnce(new Error("Notion error"));
    const res = await GET(makeRequest("bsky.app"));
    expect(res.status).toBe(500);
  });

  it("URL形式（https://bsky.app/profile/...）のactorを正しくパースする", async () => {
    const res = await GET(makeRequest("https://bsky.app/profile/bsky.app"));
    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("actor=bsky.app"),
      expect.anything()
    );
  });

  it("@ハンドル形式のactorを正しくパースする", async () => {
    const res = await GET(makeRequest("@bsky.app"));
    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("actor=bsky.app"),
      expect.anything()
    );
  });
});
