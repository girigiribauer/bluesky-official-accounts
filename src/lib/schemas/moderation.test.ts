import { describe, it, expect } from "vitest";
import { updateEntryStatusSchema } from "./moderation";

describe("updateEntryStatusSchema", () => {
  it.each(["unverified", "account_created", "dual_active", "migrated", "unknown"])(
    "%s を受け付ける",
    (status) => {
      expect(updateEntryStatusSchema.safeParse({ status }).success).toBe(true);
    }
  );

  it("not_migrated は拒否する（来てほしいアカウント側のステータス）", () => {
    expect(updateEntryStatusSchema.safeParse({ status: "not_migrated" }).success).toBe(false);
  });

  it("未知の値は拒否する", () => {
    expect(updateEntryStatusSchema.safeParse({ status: "invalid" }).success).toBe(false);
  });

  it("空文字は拒否する", () => {
    expect(updateEntryStatusSchema.safeParse({ status: "" }).success).toBe(false);
  });
});
