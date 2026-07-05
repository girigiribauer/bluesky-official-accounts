import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockCheckDuplicate = vi.fn();

vi.mock("../_checkDuplicate", () => ({
  checkDuplicate: mockCheckDuplicate,
}));

const { GET } = await import("./route");

const makeRequest = (url?: string) => {
  const reqUrl = url !== undefined
    ? `http://localhost/api/contribution/request/check?url=${encodeURIComponent(url)}`
    : "http://localhost/api/contribution/request/check";
  return new NextRequest(reqUrl);
};

describe("GET /api/contribution/request/check", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockCheckDuplicate.mockResolvedValue("none");
  });

  it("urlパラメーターがなければ400を返す", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
  });

  it("urlが空文字なら400を返す", async () => {
    const res = await GET(makeRequest(""));
    expect(res.status).toBe(400);
  });

  it("重複なしの場合は duplicate: 'none' を返す", async () => {
    const res = await GET(makeRequest("https://x.com/bluesky"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.duplicate).toBe("none");
  });

  it("来て欲しいリストと重複する場合は duplicate: 'request' を返す", async () => {
    mockCheckDuplicate.mockResolvedValueOnce("request");
    const res = await GET(makeRequest("https://x.com/bluesky"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.duplicate).toBe("request");
  });

  it("公開リストと重複する場合は duplicate: 'entry' を返す", async () => {
    mockCheckDuplicate.mockResolvedValueOnce("entry");
    const res = await GET(makeRequest("https://x.com/bluesky"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.duplicate).toBe("entry");
  });

  it("checkDuplicate がエラーのとき500を返す", async () => {
    mockCheckDuplicate.mockRejectedValueOnce(new Error("DB error"));
    const res = await GET(makeRequest("https://x.com/bluesky"));
    expect(res.status).toBe(500);
  });
});
