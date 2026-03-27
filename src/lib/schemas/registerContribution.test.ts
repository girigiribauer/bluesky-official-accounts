import { describe, it, expect } from "vitest";
import { registerContributionSchema } from "./registerContribution";

const validBase = {
  did: "did:plc:abc123",
  handle: "bsky.app",
  accountName: "Bluesky",
  oldCategory: "テクノロジー（個人・団体・技術領域）",
  fields: ["IT・テック・Web"],
  migrationStatus: "未移行（未確認）" as const,
  twitterUrl: "https://x.com/bluesky",
  evidence: "",
};

describe("registerContributionSchema", () => {
  describe("正常系", () => {
    it("未確認ステータスでevidenceなしを受け付ける", () => {
      const result = registerContributionSchema.safeParse(validBase);
      expect(result.success).toBe(true);
    });

    it("確認済みステータスでtwitterUrl+evidenceありを受け付ける", () => {
      const result = registerContributionSchema.safeParse({
        ...validBase,
        migrationStatus: "両方運用中",
        evidence: "公式サイトにリンクあり",
      });
      expect(result.success).toBe(true);
    });

    it("fieldsを1つ受け付ける", () => {
      const result = registerContributionSchema.safeParse({
        ...validBase,
        fields: ["IT・テック・Web"],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("twitterUrl", () => {
    it("空文字は拒否する", () => {
      const result = registerContributionSchema.safeParse({
        ...validBase,
        twitterUrl: "",
      });
      expect(result.success).toBe(false);
    });

    it("twitter.com URLを受け付ける", () => {
      const result = registerContributionSchema.safeParse({
        ...validBase,
        twitterUrl: "https://twitter.com/bluesky",
      });
      expect(result.success).toBe(true);
    });

    it("不正なURLフォーマットは拒否する", () => {
      const result = registerContributionSchema.safeParse({
        ...validBase,
        twitterUrl: "https://bsky.app/profile/bluesky",
      });
      expect(result.success).toBe(false);
    });

    it("150文字超は拒否する", () => {
      const result = registerContributionSchema.safeParse({
        ...validBase,
        twitterUrl: "https://x.com/" + "a".repeat(136),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("evidence の条件付き必須", () => {
    it("未確認以外でevidenceが空なら拒否する", () => {
      const result = registerContributionSchema.safeParse({
        ...validBase,
        migrationStatus: "アカウント作成済",
        evidence: "",
      });
      expect(result.success).toBe(false);
    });

    it("未確認以外でevidenceがあれば受け付ける", () => {
      const result = registerContributionSchema.safeParse({
        ...validBase,
        migrationStatus: "Bluesky 完全移行",
        evidence: "カスタムドメインのため",
      });
      expect(result.success).toBe(true);
    });

    it("未確認ならevidenceが空でも受け付ける", () => {
      const result = registerContributionSchema.safeParse({
        ...validBase,
        migrationStatus: "未移行（未確認）",
        evidence: "",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("fields", () => {
    it("空配列は拒否する", () => {
      const result = registerContributionSchema.safeParse({
        ...validBase,
        fields: [],
      });
      expect(result.success).toBe(false);
    });

    it("2つ以上は拒否する", () => {
      const result = registerContributionSchema.safeParse({
        ...validBase,
        fields: ["a", "b"],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("accountName / oldCategory", () => {
    it("accountNameが空なら拒否する", () => {
      const result = registerContributionSchema.safeParse({
        ...validBase,
        accountName: "",
      });
      expect(result.success).toBe(false);
    });

    it("accountNameが101文字なら拒否する", () => {
      const result = registerContributionSchema.safeParse({
        ...validBase,
        accountName: "a".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("oldCategoryが空なら拒否する", () => {
      const result = registerContributionSchema.safeParse({
        ...validBase,
        oldCategory: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("migrationStatus", () => {
    it("定義外のステータスは拒否する", () => {
      const result = registerContributionSchema.safeParse({
        ...validBase,
        migrationStatus: "不正なステータス",
      });
      expect(result.success).toBe(false);
    });
  });
});
