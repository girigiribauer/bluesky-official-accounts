import { test, expect } from "@playwright/test";
import { adminDb, signSessionToken, SESSION_COOKIE } from "./helpers";

// オンボーディングで分野を選ぶと、分野アイコンと「この分野が扱うクラスタ（分類）」が出ることを確認する。

const runId = Date.now();
const DID = `did:plc:e2eonboard${runId}`;
let moderatorId: string;

test.beforeAll(async () => {
  const { data, error } = await adminDb()
    .from("moderators")
    .insert({ did: DID, handle: "e2e-onboard.bsky.social", display_name: "[E2E]オンボーディング", is_admin: false })
    .select("id").single();
  if (error) throw error;
  moderatorId = data.id;
});

test.afterAll(async () => {
  const db = adminDb();
  await db.from("field_memberships").delete().eq("moderator_id", moderatorId);
  await db.from("moderators").delete().eq("id", moderatorId);
});

test("分野を選ぶと、分野アイコンとクラスタ一覧が表示される", async ({ page, context }) => {
  await context.addCookies([{ name: SESSION_COOKIE, value: signSessionToken(DID), url: "http://127.0.0.1:15010" }]);
  await page.goto("/moderation_beta/onboard");

  // 選択前はアイコンも詳細も出ていない
  await expect(page.locator('img[src*="/images/fields/"]')).toHaveCount(0);

  // 公的機関・社会インフラを選ぶ
  await page.getByText("公的機関・社会インフラ", { exact: true }).click();

  // 分野アイコン（svg）が出る
  await expect(page.locator('img[src="/images/fields/public_infrastructure.svg"]')).toBeVisible();

  // 「この分野が扱うもの」の見出しと、運営が定める方向性クラスタ（fields.ts の静的な clusters）が並ぶ
  await expect(page.getByText("この分野が扱うもの")).toBeVisible();
  // public_infrastructure の方向性クラスタの一部
  await expect(page.getByText("政党・政治団体", { exact: true })).toBeVisible();
  await expect(page.getByText("記者・ジャーナリスト", { exact: true })).toBeVisible();
});
