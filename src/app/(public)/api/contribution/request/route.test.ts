import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockCheckDuplicate = vi.fn();
const mockInsert = vi.fn();
const mockAccountSingle = vi.fn();

vi.mock("./_checkDuplicate", () => ({
  checkDuplicate: mockCheckDuplicate,
}));

vi.mock("src/lib/supabaseClient", () => ({
  getSupabaseClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === "accounts") {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({ single: mockAccountSingle })),
          })),
        };
      }
      // requests
      return { insert: mockInsert };
    }),
  })),
}));

vi.stubEnv("SUPABASE_URL", "https://dummy.supabase.co");
vi.stubEnv("SUPABASE_SECRET_KEY", "dummy");

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
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockCheckDuplicate.mockResolvedValue(false);
    mockAccountSingle.mockResolvedValue({ data: { id: "mock-account-id" }, error: null });
    mockInsert.mockResolvedValue({ error: null });
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
    mockCheckDuplicate.mockResolvedValueOnce(true);
    const res = await POST(makeRequest({
      twitterUrl: "https://x.com/bluesky",
      twitterName: "Bluesky",
      website: "",
    }));
    expect(res.status).toBe(409);
  });

  it("Supabase insert が失敗したら500を返す", async () => {
    mockAccountSingle.mockResolvedValueOnce({ data: null, error: new Error("DB error") });
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
