import { describe, it, expect, vi } from "vitest";

describe("isAllowedBetaUser", () => {
  it("許可リストの DID は通す", async () => {
    vi.stubEnv("BETA_ALLOWED_DIDS", "did:plc:aaa,did:plc:bbb");
    const { isAllowedBetaUser } = await import("./betaAllowList");
    expect(isAllowedBetaUser("did:plc:aaa")).toBe(true);
    expect(isAllowedBetaUser("did:plc:bbb")).toBe(true);
  });

  it("許可リストにない DID は弾く", async () => {
    vi.stubEnv("BETA_ALLOWED_DIDS", "did:plc:aaa");
    const { isAllowedBetaUser } = await import("./betaAllowList");
    expect(isAllowedBetaUser("did:plc:unknown")).toBe(false);
  });

  it("BETA_ALLOWED_DIDS が未設定なら全員弾く", async () => {
    vi.stubEnv("BETA_ALLOWED_DIDS", "");
    const { isAllowedBetaUser } = await import("./betaAllowList");
    expect(isAllowedBetaUser("did:plc:anyone")).toBe(false);
  });

  it("スペースが混入していても正しく判定する", async () => {
    vi.stubEnv("BETA_ALLOWED_DIDS", " did:plc:aaa , did:plc:bbb ");
    const { isAllowedBetaUser } = await import("./betaAllowList");
    expect(isAllowedBetaUser("did:plc:aaa")).toBe(true);
  });
});
