import { describe, it, expect } from "vitest";
import { requestContributionSchema } from "./requestContribution";

describe("requestContributionSchema", () => {
  describe("twitterUrl", () => {
    it("x.com URLを受け付ける", () => {
      const result = requestContributionSchema.safeParse({
        twitterUrl: "https://x.com/bluesky",
        twitterName: "Bluesky",
        fieldId: "business",
      });
      expect(result.success).toBe(true);
    });

    it("twitter.com URLを受け付ける", () => {
      const result = requestContributionSchema.safeParse({
        twitterUrl: "https://twitter.com/bluesky",
        twitterName: "Bluesky",
        fieldId: "business",
      });
      expect(result.success).toBe(true);
    });

    it("パスつきURLを受け付ける", () => {
      const result = requestContributionSchema.safeParse({
        twitterUrl: "https://x.com/bluesky/",
        twitterName: "Bluesky",
        fieldId: "business",
      });
      expect(result.success).toBe(true);
    });

    it("httpは拒否する", () => {
      const result = requestContributionSchema.safeParse({
        twitterUrl: "http://x.com/bluesky",
        twitterName: "Bluesky",
        fieldId: "business",
      });
      expect(result.success).toBe(false);
    });

    it("他ドメインは拒否する", () => {
      const result = requestContributionSchema.safeParse({
        twitterUrl: "https://bsky.app/profile/bluesky.bsky.social",
        twitterName: "Bluesky",
        fieldId: "business",
      });
      expect(result.success).toBe(false);
    });

    it("ユーザー名なしは拒否する", () => {
      const result = requestContributionSchema.safeParse({
        twitterUrl: "https://x.com/",
        twitterName: "Bluesky",
        fieldId: "business",
      });
      expect(result.success).toBe(false);
    });

    it("ユーザー名が16文字以上は拒否する", () => {
      const result = requestContributionSchema.safeParse({
        twitterUrl: "https://x.com/abcdefghijklmnop", // 16文字
        twitterName: "Bluesky",
        fieldId: "business",
      });
      expect(result.success).toBe(false);
    });

    it("ユーザー名が15文字は受け付ける", () => {
      const result = requestContributionSchema.safeParse({
        twitterUrl: "https://x.com/abcdefghijklmno", // 15文字
        twitterName: "Bluesky",
        fieldId: "business",
      });
      expect(result.success).toBe(true);
    });

    it("150文字超は拒否する", () => {
      const result = requestContributionSchema.safeParse({
        twitterUrl: "https://x.com/" + "a".repeat(136), // 合計151文字
        twitterName: "Bluesky",
        fieldId: "business",
      });
      expect(result.success).toBe(false);
    });

    it("空文字は拒否する", () => {
      const result = requestContributionSchema.safeParse({
        twitterUrl: "",
        twitterName: "Bluesky",
        fieldId: "business",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("fieldId", () => {
    it("有効な分野IDを受け付ける", () => {
      const result = requestContributionSchema.safeParse({
        twitterUrl: "https://x.com/bluesky",
        twitterName: "Bluesky",
        fieldId: "business",
      });
      expect(result.success).toBe(true);
    });

    it("無効な分野IDは拒否する", () => {
      const result = requestContributionSchema.safeParse({
        twitterUrl: "https://x.com/bluesky",
        twitterName: "Bluesky",
        fieldId: "invalid_field",
      });
      expect(result.success).toBe(false);
    });

    it("fieldIdなしは拒否する", () => {
      const result = requestContributionSchema.safeParse({
        twitterUrl: "https://x.com/bluesky",
        twitterName: "Bluesky",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("twitterName", () => {
    it("通常の名称を受け付ける", () => {
      const result = requestContributionSchema.safeParse({
        twitterUrl: "https://x.com/bluesky",
        twitterName: "Bluesky",
        fieldId: "business",
      });
      expect(result.success).toBe(true);
    });

    it("空文字は拒否する", () => {
      const result = requestContributionSchema.safeParse({
        twitterUrl: "https://x.com/bluesky",
        twitterName: "",
        fieldId: "business",
      });
      expect(result.success).toBe(false);
    });

    it("100文字は受け付ける", () => {
      const result = requestContributionSchema.safeParse({
        twitterUrl: "https://x.com/bluesky",
        twitterName: "a".repeat(100),
        fieldId: "business",
      });
      expect(result.success).toBe(true);
    });

    it("101文字は拒否する", () => {
      const result = requestContributionSchema.safeParse({
        twitterUrl: "https://x.com/bluesky",
        twitterName: "a".repeat(101),
        fieldId: "business",
      });
      expect(result.success).toBe(false);
    });
  });
});
