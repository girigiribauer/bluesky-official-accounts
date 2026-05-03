import { describe, it, expect, vi, beforeEach } from "vitest";

const mockLogout = vi.fn();
vi.mock("src/lib/auth", () => ({
  logout: mockLogout,
  SESSION_COOKIE: "moderator_did",
}));

const mockRevoke = vi.fn().mockResolvedValue(undefined);
vi.mock("src/lib/oauthClient", () => ({
  getOAuthClient: vi.fn().mockResolvedValue({ revoke: mockRevoke }),
}));

const mockRedirect = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

const mockCookieGet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({ get: mockCookieGet })),
}));

const { logoutAction } = await import("./authActions");

beforeEach(() => {
  vi.clearAllMocks();
  mockRevoke.mockResolvedValue(undefined);
});

describe("logoutAction", () => {
  it("Cookie に DID がない場合、revoke を呼ばずにログアウトする", async () => {
    mockCookieGet.mockReturnValue(undefined);
    await logoutAction(new FormData());
    expect(mockRevoke).not.toHaveBeenCalled();
    expect(mockLogout).toHaveBeenCalled();
  });

  it("Cookie に DID がある場合、revoke してからログアウトする", async () => {
    mockCookieGet.mockReturnValue({ value: "did:plc:test" });
    await logoutAction(new FormData());
    expect(mockRevoke).toHaveBeenCalledWith("did:plc:test");
    expect(mockLogout).toHaveBeenCalled();
  });

  it("revoke が失敗してもログアウトする", async () => {
    mockCookieGet.mockReturnValue({ value: "did:plc:test" });
    mockRevoke.mockRejectedValueOnce(new Error("revoke failed"));
    await logoutAction(new FormData());
    expect(mockLogout).toHaveBeenCalled();
  });

  it("returnTo が保護パスのとき、/ にリダイレクトする", async () => {
    mockCookieGet.mockReturnValue(undefined);
    const formData = new FormData();
    formData.set("returnTo", "/moderation_beta/something");
    await logoutAction(formData);
    expect(mockRedirect).toHaveBeenCalledWith("/");
  });

  it("returnTo が非保護パスのとき、returnTo にリダイレクトする", async () => {
    mockCookieGet.mockReturnValue(undefined);
    const formData = new FormData();
    formData.set("returnTo", "/public-page");
    await logoutAction(formData);
    expect(mockRedirect).toHaveBeenCalledWith("/public-page");
  });

  it("returnTo がないとき、/ にリダイレクトする", async () => {
    mockCookieGet.mockReturnValue(undefined);
    await logoutAction(new FormData());
    expect(mockRedirect).toHaveBeenCalledWith("/");
  });
});
