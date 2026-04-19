import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockMaybeSingle = vi.fn();
const mockFrom = vi.fn(() => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  maybeSingle: mockMaybeSingle,
}));

vi.mock("src/lib/supabaseClient", () => ({
  getSupabaseClient: vi.fn(() => ({ from: mockFrom })),
}));

vi.stubEnv("SUPABASE_URL", "https://dummy.supabase.co");
vi.stubEnv("SUPABASE_SECRET_KEY", "dummy");

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
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
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

  it("Supabaseに既存レコードがある場合は status: registered を返す", async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: {
        twitter_handle: "bluesky",
        transition_status: "dual_active",
        accounts: {
          display_name: "Bluesky",
          old_category: "テクノロジー",
          evidences: [{ content: "https://example.com" }],
        },
      },
      error: null,
    });
    const res = await GET(makeRequest("bsky.app"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("registered");
    expect(json.existing.name).toBe("Bluesky");
    expect(json.existing.status).toBe("dual_active");
    expect(json.existing.twitter).toBe("https://x.com/bluesky");
    expect(json.existing.source).toBe("https://example.com");
  });

  it("Supabaseがエラーのとき500を返す", async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: new Error("DB error") });
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
