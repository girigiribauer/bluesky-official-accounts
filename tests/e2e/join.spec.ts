import { test, expect } from "@playwright/test";
import { adminDb, signSessionToken, SESSION_COOKIE } from "./helpers";

// OAuth は通さず署名済みセッション cookie を直接セットする（本物の Bluesky ログインを迂回するため）。

const runId = Date.now();
const DID_A = `did:plc:e2ejoina${runId}`;
const DID_B = `did:plc:e2ejoinb${runId}`;
let modAId: string;
let modBId: string;

async function membershipFields(moderatorId: string): Promise<string[]> {
  const { data } = await adminDb().from("field_memberships").select("field_id").eq("moderator_id", moderatorId);
  return (data ?? []).map((m) => m.field_id);
}

test.beforeAll(async () => {
  const db = adminDb();
  const insMod = async (did: string, name: string) => {
    const { data, error } = await db
      .from("moderators")
      .insert({ did, handle: `${name}.bsky.social`, display_name: `[E2E]${name}`, is_admin: false })
      .select("id").single();
    if (error) throw error;
    return data.id;
  };
  modAId = await insMod(DID_A, "join-a");
  modBId = await insMod(DID_B, "join-b");
  await db.from("field_memberships").insert({ moderator_id: modBId, field_id: "tech" });
});

test.afterAll(async () => {
  const db = adminDb();
  await db.from("field_memberships").delete().in("moderator_id", [modAId, modBId]);
  await db.from("moderators").delete().in("id", [modAId, modBId]);
});

test("A. 完全未参加のユーザーは /onboard に誘導され、1つ目の分野に参加できる", async ({ page, context }) => {
  await context.addCookies([{ name: SESSION_COOKIE, value: signSessionToken(DID_A), url: "http://127.0.0.1:15010" }]);

  await page.goto("/moderation_beta");
  await expect(page).toHaveURL(/\/moderation_beta\/onboard/);

  await page.getByRole("button", { name: "公的機関・社会インフラ" }).click();
  await page.getByRole("button", { name: "選択した分野に参加する" }).click();

  await expect(page).toHaveURL(/\/moderation_beta\?field=public_infrastructure/);
  await expect.poll(async () => membershipFields(modAId)).toEqual(["public_infrastructure"]);
});

test("B. 参加済みユーザーはダッシュボードの「分野を追加」から追加の分野に参加できる", async ({ page, context }) => {
  await context.addCookies([{ name: SESSION_COOKIE, value: signSessionToken(DID_B), url: "http://127.0.0.1:15010" }]);

  await page.goto("/moderation_beta");
  await expect(page).toHaveURL(/\/moderation_beta(\?|$)/);

  await page.getByRole("button", { name: /すべての分野|チーム/ }).click();
  await page.getByRole("link", { name: "分野を追加" }).click();
  await expect(page).toHaveURL(/\/moderation_beta\/onboard/);

  // tech は参加済みなので別分野を選ぶ
  await page.getByRole("button", { name: "企業・ブランド・サービス" }).click();
  await page.getByRole("button", { name: "選択した分野に参加する" }).click();

  await expect(page).toHaveURL(/\/moderation_beta\?field=business/);
  await expect.poll(async () => (await membershipFields(modBId)).sort()).toEqual(["business", "tech"]);
});
