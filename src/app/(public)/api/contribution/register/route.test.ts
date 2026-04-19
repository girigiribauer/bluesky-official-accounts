import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockSingle = vi.fn();
const mockInsert = vi.fn();

vi.mock("src/lib/supabaseClient", () => ({
  getSupabaseClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === "accounts") {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({ single: mockSingle })),
          })),
        };
      }
      // entries / account_fields / evidences
      return { insert: mockInsert };
    }),
  })),
}));

vi.stubEnv("SUPABASE_URL", "https://dummy.supabase.co");
vi.stubEnv("SUPABASE_SECRET_KEY", "dummy");

const { POST } = await import("./route");

const validBody = {
  did: "did:plc:abc123",
  handle: "bsky.app",
  accountName: "Bluesky",
  oldCategory: "テクノロジー（個人・団体・技術領域）",
  fields: ["IT・テック・Web"],
  migrationStatus: "dual_active",
  twitterUrl: "https://x.com/bluesky",
  evidence: "カスタムドメインのため",
  website: "",
};

let ipCounter = 0;
const makeRequest = (body: unknown, ip?: string, origin?: string) =>
  new NextRequest("http://localhost/api/contribution/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip ?? `10.0.0.${++ipCounter}`,
      host: "localhost",
      ...(origin !== undefined && { origin }),
    },
    body: JSON.stringify(body),
  });

describe("POST /api/contribution/register", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockSingle.mockResolvedValue({ data: { id: "mock-account-id" }, error: null });
    mockInsert.mockResolvedValue({ error: null });
  });

  it("正常な入力で200を返す", async () => {
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  it("ハニーポットが埋まっていたら400を返す", async () => {
    const res = await POST(makeRequest({ ...validBody, website: "filled" }));
    expect(res.status).toBe(400);
  });

  it("accountNameが空なら400を返す", async () => {
    const res = await POST(makeRequest({ ...validBody, accountName: "" }));
    expect(res.status).toBe(400);
  });

  it("fieldsが空なら400を返す", async () => {
    const res = await POST(makeRequest({ ...validBody, fields: [] }));
    expect(res.status).toBe(400);
  });

  it("fieldsが2つ以上なら400を返す", async () => {
    const res = await POST(makeRequest({ ...validBody, fields: ["a", "b"] }));
    expect(res.status).toBe(400);
  });

  it("未確認以外でevidenceが空なら400を返す", async () => {
    const res = await POST(makeRequest({
      ...validBody,
      migrationStatus: "dual_active",
      evidence: "",
    }));
    expect(res.status).toBe(400);
  });

  it("twitterUrlが空なら400を返す", async () => {
    const res = await POST(makeRequest({ ...validBody, twitterUrl: "" }));
    expect(res.status).toBe(400);
  });

  it("不正なtwitterUrlフォーマットは400を返す", async () => {
    const res = await POST(makeRequest({
      ...validBody,
      twitterUrl: "https://bsky.app/profile/bluesky",
    }));
    expect(res.status).toBe(400);
  });

  it("Supabase insert が失敗したら500を返す", async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: new Error("DB error") });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(500);
  });

  it("別オリジンからのリクエストは403を返す", async () => {
    const res = await POST(makeRequest(validBody, undefined, "https://evil.example.com"));
    expect(res.status).toBe(403);
  });

  it("同一オリジンからのリクエストは通過する", async () => {
    const res = await POST(makeRequest(validBody, undefined, "http://localhost"));
    expect(res.status).toBe(200);
  });
});
