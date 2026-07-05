import { test, expect } from "@playwright/test";
import { adminDb, signSessionToken, SESSION_COOKIE } from "./helpers";

// モデレーターの承認フロー。
// Bluesky OAuth は通さず、署名済みセッション cookie を直接セットして認証済み状態を作る。

const runId = Date.now();
const MOD_DID = `did:plc:e2emod${runId}`;
const SUB_DID = `did:plc:e2esub${runId}`;
const SUB_NAME = `[テスト] E2E承認対象${runId}`;

let moderatorId: string;
let submissionId: string;

test.beforeAll(async () => {
  const db = adminDb();

  const { data: mod, error: modError } = await db
    .from("moderators")
    .insert({
      did: MOD_DID,
      handle: "e2e-mod.bsky.social",
      display_name: "[テスト] E2Eモデレーター",
      is_admin: true,
    })
    .select("id")
    .single();
  if (modError) throw modError;
  moderatorId = mod.id;

  const { data: sub, error: subError } = await db
    .from("entry_submissions")
    .insert({
      account_name: SUB_NAME,
      bluesky_did: SUB_DID,
      bluesky_handle: "e2e-approve.bsky.social",
      field_id: "business",
      transition_status: "dual_active",
    })
    .select("id")
    .single();
  if (subError) throw subError;
  submissionId = sub.id;
});

test.afterAll(async () => {
  const db = adminDb();

  // 承認済みデータの後始末（FK 順）
  const { data: entry } = await db
    .from("entries")
    .select("account_id")
    .eq("bluesky_did", SUB_DID)
    .maybeSingle();
  if (entry?.account_id) {
    await db.from("evidences").delete().eq("account_id", entry.account_id);
    await db.from("account_fields").delete().eq("account_id", entry.account_id);
    await db.from("entries").delete().eq("account_id", entry.account_id);
    await db.from("requests").delete().eq("account_id", entry.account_id);
    await db.from("accounts").delete().eq("id", entry.account_id);
  }
  await db.from("activities").delete().eq("moderator_id", moderatorId);
  await db.from("entry_submissions").delete().eq("bluesky_did", SUB_DID);
  await db.from("field_memberships").delete().eq("moderator_id", moderatorId);
  await db.from("moderators").delete().eq("id", moderatorId);
});

test("申請カードを開いて承認すると、公開リストに追加されカードが消える", async ({ page, context }) => {
  await context.addCookies([
    {
      name: SESSION_COOKIE,
      value: signSessionToken(MOD_DID),
      url: "http://127.0.0.1:15010",
    },
  ]);

  await page.goto("/moderation_beta");

  const card = page.getByRole("link", { name: new RegExp(SUB_NAME.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) });
  await expect(card).toBeVisible();
  await card.click();

  const approve = page.getByRole("button", { name: "承認する" });
  await expect(approve).toBeVisible();
  await approve.click();

  await expect(card).toBeHidden();

  const { data: entry } = await adminDb()
    .from("entries")
    .select("bluesky_handle, transition_status, approved_at")
    .eq("bluesky_did", SUB_DID)
    .single();
  expect(entry?.bluesky_handle).toBe("e2e-approve.bsky.social");
  expect(entry?.transition_status).toBe("dual_active");
  expect(entry?.approved_at).not.toBeNull();

  const { data: gone } = await adminDb()
    .from("entry_submissions")
    .select("id")
    .eq("id", submissionId)
    .maybeSingle();
  expect(gone).toBeNull();
});
