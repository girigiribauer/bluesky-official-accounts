import { describe, it, expect, vi } from "vitest";

const mockQuery = vi.fn();

vi.mock("src/lib/notionClient", () => ({
  getNotionClient: vi.fn(() => ({
    databases: { query: mockQuery },
  })),
}));

vi.stubEnv("ACCOUNTLIST_DATABASE", "mock-db-id");
vi.stubEnv("NOTION_API_KEY", "mock-api-key");

const { checkDuplicate } = await import("./_checkDuplicate");

describe("checkDuplicate", () => {
  it("該当レコードがあれば true を返す", async () => {
    mockQuery.mockResolvedValue({ results: [{ id: "page-1" }] });
    expect(await checkDuplicate("https://x.com/existing")).toBe(true);
  });

  it("該当レコードがなければ false を返す", async () => {
    mockQuery.mockResolvedValue({ results: [] });
    expect(await checkDuplicate("https://x.com/new")).toBe(false);
  });

  it("ACCOUNTLIST_DATABASE が未設定なら throw する", async () => {
    vi.stubEnv("ACCOUNTLIST_DATABASE", "");
    await expect(checkDuplicate("https://x.com/test")).rejects.toThrow();
    vi.stubEnv("ACCOUNTLIST_DATABASE", "mock-db-id");
  });
});
