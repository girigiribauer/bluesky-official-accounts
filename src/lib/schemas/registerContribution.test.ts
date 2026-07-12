import { describe, it, expect } from "vitest";
import { registerContributionSchema } from "./registerContribution";

const validBase = {
  did: "did:plc:abc123",
  handle: "bsky.app",
  accountName: "Bluesky",
  fields: ["tech"],
  migrationStatus: "dual_active" as const,
  twitterUrl: "https://x.com/bluesky",
  evidence: "カスタムドメインのため",
};

describe("registerContributionSchema", () => {
  describe("正常系", () => {
    it("最低限の入力を受け付ける", () => {
      const result = registerContributionSchema.safeParse(validBase);
      expect(result.success).toBe(true);
    });

    it("確認済みステータスでtwitterUrl+evidenceありを受け付ける", () => {
      const result = registerContributionSchema.safeParse({
        ...validBase,
        migrationStatus: "dual_active",
        evidence: "公式サイトにリンクあり",
      });
      expect(result.success).toBe(true);
    });

    it("fieldsを1つ受け付ける", () => {
      const result = registerContributionSchema.safeParse({
        ...validBase,
        fields: ["tech"],
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

  describe("evidence は任意", () => {
    it("evidenceが空でも受け付ける", () => {
      const result = registerContributionSchema.safeParse({
        ...validBase,
        evidence: "",
      });
      expect(result.success).toBe(true);
    });

    it("evidenceがあれば受け付ける", () => {
      const result = registerContributionSchema.safeParse({
        ...validBase,
        evidence: "カスタムドメインのため",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("twitterUrl と migrationStatus の条件", () => {
    it("migratedのときtwitterUrlが空でも受け付ける", () => {
      const result = registerContributionSchema.safeParse({
        ...validBase,
        migrationStatus: "migrated",
        twitterUrl: "",
      });
      expect(result.success).toBe(true);
    });

    it("dual_activeのときtwitterUrlが空なら拒否する", () => {
      const result = registerContributionSchema.safeParse({
        ...validBase,
        migrationStatus: "dual_active",
        twitterUrl: "",
      });
      expect(result.success).toBe(false);
    });

    it("account_createdのときtwitterUrlが空なら拒否する", () => {
      const result = registerContributionSchema.safeParse({
        ...validBase,
        migrationStatus: "account_created",
        twitterUrl: "",
      });
      expect(result.success).toBe(false);
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

  describe("accountName", () => {
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
