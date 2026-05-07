import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockDelete = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: mockSelect,
      update: mockUpdate,
      delete: mockDelete,
    })),
  })),
}));

vi.stubEnv("SUPABASE_URL", "http://localhost:54321");
vi.stubEnv("SUPABASE_SECRET_KEY", "test-key");
vi.stubEnv("OAUTH_PRIVATE_KEY", "test-secret");

const MODERATOR = {
  id: "uuid-1",
  did: "did:plc:test",
  handle: "admin",
  display_name: "管理者",
  is_admin: false,
  avatar: null,
  created_at: "2026-01-01T00:00:00Z",
};

// next/headers の cookies() をモック
const mockCookieGet = vi.fn();
const mockCookieDelete = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: mockCookieGet,
    delete: mockCookieDelete,
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockSelect.mockReturnValue({ eq: mockEq });
  mockUpdate.mockReturnValue({ eq: vi.fn().mockResolvedValue({}) });
  mockEq.mockReturnValue({ single: mockSingle });
  mockDelete.mockReturnValue({ eq: vi.fn() });
});

const { getCurrentModerator, logout, signToken, verifyToken } = await import("./auth");

describe("signToken / verifyToken", () => {
  it("署名したトークンを検証できる", () => {
    const token = signToken("did:plc:test");
    expect(verifyToken(token)).toBe("did:plc:test");
  });

  it("改ざんされたトークンは null を返す", () => {
    const token = signToken("did:plc:test");
    expect(verifyToken(token + "x")).toBeNull();
  });

  it("署名なしの平文 DID は null を返す", () => {
    expect(verifyToken("did:plc:test")).toBeNull();
  });
});

describe("getCurrentModerator", () => {
  it("Cookie に DID がなければ null を返す", async () => {
    mockCookieGet.mockReturnValue(undefined);
    const result = await getCurrentModerator();
    expect(result).toBeNull();
  });

  it("正しい署名付きトークンがあり moderators に存在すれば返す", async () => {
    mockCookieGet.mockReturnValue({ value: signToken("did:plc:test") });
    mockSingle.mockResolvedValue({ data: MODERATOR });
    const result = await getCurrentModerator();
    expect(result).toEqual(MODERATOR);
  });

  it("モデレーターが存在するとき last_active_at を更新する", async () => {
    mockCookieGet.mockReturnValue({ value: signToken("did:plc:test") });
    mockSingle.mockResolvedValue({ data: MODERATOR });
    await getCurrentModerator();
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ last_active_at: expect.any(String) })
    );
  });

  it("署名なし平文 DID の Cookie は null を返す", async () => {
    mockCookieGet.mockReturnValue({ value: "did:plc:test" });
    const result = await getCurrentModerator();
    expect(result).toBeNull();
  });

  it("正しいトークンだが moderators に存在しなければ null を返す", async () => {
    mockCookieGet.mockReturnValue({ value: signToken("did:plc:unknown") });
    mockSingle.mockResolvedValue({ data: null });
    const result = await getCurrentModerator();
    expect(result).toBeNull();
  });
});

describe("logout", () => {
  it("Cookie を削除する", async () => {
    await logout();
    expect(mockCookieDelete).toHaveBeenCalledWith("moderator_did");
  });
});
