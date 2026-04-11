import { describe, it, expect } from "vitest";
import { calcReviewCount, calcMemberCount } from "./moderationStats";

describe("calcReviewCount", () => {
  it("全分野のとき、レビューした全件数を返す", () => {
    const fieldIds = ["tech", "sports", "tech", null];
    expect(calcReviewCount(fieldIds, undefined)).toBe(4);
  });

  it("分野フィルター中は、その分野のレビュー件数のみ返す", () => {
    const fieldIds = ["tech", "sports", "tech", null];
    expect(calcReviewCount(fieldIds, "tech")).toBe(2);
  });

  it("該当する分野がないとき、0を返す", () => {
    const fieldIds = ["tech", "sports"];
    expect(calcReviewCount(fieldIds, "music")).toBe(0);
  });

  it("レビュー履歴が空のとき、0を返す", () => {
    expect(calcReviewCount([], "tech")).toBe(0);
  });
});

describe("calcMemberCount", () => {
  const memberships = [
    { moderator_id: "mod-1", field_id: "tech", moderators: { is_admin: false } },
    { moderator_id: "mod-2", field_id: "tech", moderators: { is_admin: false } },
    { moderator_id: "mod-2", field_id: "sports", moderators: { is_admin: false } },
    { moderator_id: "mod-3", field_id: "sports", moderators: { is_admin: false } },
  ];

  it("全分野のとき、ユニークなメンバー数 + 管理者数を返す", () => {
    expect(calcMemberCount(memberships, 2, undefined)).toBe(5); // 3人 + 管理者2人
  });

  it("分野フィルター中は、その分野のメンバー数のみ返す（管理者は除く）", () => {
    expect(calcMemberCount(memberships, 2, "tech")).toBe(2);
  });

  it("分野フィルター中、同一人物が複数エントリあってもカウントは1", () => {
    const dup = [
      { moderator_id: "mod-1", field_id: "tech", moderators: { is_admin: false } },
      { moderator_id: "mod-1", field_id: "tech", moderators: { is_admin: false } },
    ];
    expect(calcMemberCount(dup, 0, "tech")).toBe(1);
  });

  it("分野フィルター中、管理者フラグのあるメンバーはカウントしない", () => {
    const withAdmin = [
      { moderator_id: "mod-1", field_id: "tech", moderators: { is_admin: false } },
      { moderator_id: "admin-1", field_id: "tech", moderators: { is_admin: true } },
    ];
    expect(calcMemberCount(withAdmin, 1, "tech")).toBe(1);
  });

  it("該当する分野のメンバーがいないとき、0を返す", () => {
    expect(calcMemberCount(memberships, 0, "music")).toBe(0);
  });

  it("field_memberships が空のとき、管理者数のみ返す（全分野）", () => {
    expect(calcMemberCount([], 3, undefined)).toBe(3);
  });
});
