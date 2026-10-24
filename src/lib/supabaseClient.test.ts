import { afterEach, describe, expect, it, vi } from "vitest";
import { getSupabaseClient } from "./supabaseClient";

vi.stubEnv("SUPABASE_URL", "http://localhost:54321");
vi.stubEnv("SUPABASE_SECRET_KEY", "test-key");

describe("getSupabaseClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("クライアントを作っても、トークン自動更新の定期処理を起動しない", async () => {
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");

    const client = getSupabaseClient();
    await client.auth.initialize();

    expect(setIntervalSpy).not.toHaveBeenCalled();
  });
});
