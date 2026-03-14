import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: () => unknown) => fn,
}));

vi.mock("fs/promises", () => ({
  readFile: vi.fn(),
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const { readFile } = await import("fs/promises");
const mockReadFile = vi.mocked(readFile);

const { fetchAccounts, fetchNews, fetchCategories } = await import("./fetchNotion");

const mockAccountList = {
  updatedTime: "2024-01-01T00:00:00Z",
  total: 1,
  checkedTotal: 1,
  customDomainAccounts: 0,
  weeklyPostedAccounts: 0,
  monthlyPostedAccounts: 0,
  accounts: [],
};

const mockNews = [{ id: "1", name: "ニュース", date: "2024-01-01" }];
const mockCategories = [{ id: "1", title: "カテゴリ", order: 1, criteria: "" }];

describe("fetchNotion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReadFile.mockRejectedValue(new Error("ENOENT"));
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockAccountList,
    });
  });

  describe("fetchAccounts", () => {
    it("ローカルJSONがあればそれを返す", async () => {
      mockReadFile.mockResolvedValueOnce(JSON.stringify(mockAccountList));
      const result = await fetchAccounts();
      expect(result).toEqual(mockAccountList);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("ローカルJSONがなければGitHub rawから取得する", async () => {
      const result = await fetchAccounts();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("accounts.json"),
        expect.anything()
      );
      expect(result).toEqual(mockAccountList);
    });

    it("GitHub fetchが失敗したらエラーをthrowする", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
      await expect(fetchAccounts()).rejects.toThrow("GitHub fetch failed: 404");
    });
  });

  describe("fetchNews", () => {
    it("ローカルJSONがなければGitHub rawから取得する", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockNews });
      const result = await fetchNews();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("news.json"),
        expect.anything()
      );
      expect(result).toEqual(mockNews);
    });
  });

  describe("fetchCategories", () => {
    it("ローカルJSONがなければGitHub rawから取得する", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockCategories });
      const result = await fetchCategories();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("categories.json"),
        expect.anything()
      );
      expect(result).toEqual(mockCategories);
    });
  });
});