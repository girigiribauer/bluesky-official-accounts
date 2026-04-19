import { describe, it, expect, vi } from "vitest";

const mockFrom = vi.fn();

vi.mock("src/lib/supabaseClient", () => ({
  getSupabaseClient: vi.fn(() => ({ from: mockFrom })),
}));

vi.stubEnv("SUPABASE_URL", "https://dummy.supabase.co");
vi.stubEnv("SUPABASE_SECRET_KEY", "dummy");

const { checkDuplicate } = await import("./_checkDuplicate");

// Supabase のクエリチェーンをモックするヘルパー。
// requests・entries どちらも .eq() で終わるため、
// チェーン自体を thenable にして await できるようにする。
const makeChain = (count: number) => {
  const result = Promise.resolve({ count, error: null });
  const chain: Record<string, unknown> = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    then: result.then.bind(result),
    catch: result.catch.bind(result),
  };
  return chain;
};

describe("checkDuplicate", () => {
  it("requestsにもentriesにも存在しなければ false を返す", async () => {
    mockFrom.mockImplementation(() => makeChain(0));
    expect(await checkDuplicate("https://x.com/new")).toBe(false);
  });

  it("requestsに存在すれば true を返す", async () => {
    let call = 0;
    mockFrom.mockImplementation(() => makeChain(call++ === 0 ? 1 : 0));
    expect(await checkDuplicate("https://x.com/existing")).toBe(true);
  });

  it("entriesに存在すれば true を返す", async () => {
    let call = 0;
    mockFrom.mockImplementation(() => makeChain(call++ === 0 ? 0 : 1));
    expect(await checkDuplicate("https://x.com/existing")).toBe(true);
  });

  it("twitter.com 形式のURLも処理できる", async () => {
    mockFrom.mockImplementation(() => makeChain(1));
    expect(await checkDuplicate("https://twitter.com/existing")).toBe(true);
  });

  it("解析できないURLフォーマットは false を返す", async () => {
    mockFrom.mockImplementation(() => makeChain(0));
    expect(await checkDuplicate("https://bsky.app/profile/bluesky")).toBe(false);
  });
});
