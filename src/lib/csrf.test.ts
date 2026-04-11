import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { checkOrigin } from "./csrf";

const makeRequest = (origin: string | null, host: string) => {
  const headers: Record<string, string> = { host };
  if (origin !== null) headers["origin"] = origin;
  return new NextRequest("http://localhost/api/test", { method: "POST", headers });
};

describe("checkOrigin", () => {
  it("Origin がなければ通過する", () => {
    expect(checkOrigin(makeRequest(null, "localhost"))).toBe(true);
  });

  it("同一オリジンは通過する", () => {
    expect(checkOrigin(makeRequest("http://localhost:3000", "localhost:3000"))).toBe(true);
  });

  it("別オリジンは弾く", () => {
    expect(checkOrigin(makeRequest("https://evil.example.com", "localhost:3000"))).toBe(false);
  });

  it("不正な Origin URL は弾く", () => {
    expect(checkOrigin(makeRequest("not-a-url", "localhost"))).toBe(false);
  });

  it("スキームが違っても host が一致すれば通過する", () => {
    expect(checkOrigin(makeRequest("https://example.com", "example.com"))).toBe(true);
  });
});
