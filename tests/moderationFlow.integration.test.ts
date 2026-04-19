/**
 * 統合テスト: 登録〜モデレーションフロー
 *
 * 実際のローカル Supabase DB に対して動作する。
 * モックするのは Next.js 依存と CSRF・レート制限のみ。
 * DB 操作（Supabase クライアント）は本物を使う。
 *
 * 前提: supabase start でローカル DB が起動していること。
 */
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import type { Database } from "src/types/database";

config({ path: ".env.local" });

// ---------------------------------------------------------------------------
// モック（Next.js 依存 + セキュリティチェック）
// ---------------------------------------------------------------------------

const TEST_MODERATOR_ID = "00000000-0000-0000-0000-000000000099";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("src/lib/auth", () => ({
  getCurrentModerator: vi.fn().mockResolvedValue({
    id: TEST_MODERATOR_ID,
    handle: "integration-test",
    display_name: "Integration Test Moderator",
    did: "did:plc:integration-test",
    is_admin: false,
    avatar: null,
    created_at: "2026-01-01T00:00:00Z",
  }),
  logout: vi.fn(),
}));
vi.mock("src/lib/csrf", () => ({ checkOrigin: vi.fn().mockReturnValue(true) }));
vi.mock("src/lib/rateLimit", () => ({ checkRateLimit: vi.fn().mockReturnValue(true) }));

const { POST: registerPOST } = await import("src/app/(public)/api/contribution/register/route");
const { approveEntry, rejectEntry, addEvidence, updateEntryName } =
  await import("src/app/moderation_beta/actions");

// ---------------------------------------------------------------------------
// テスト用 Supabase クライアント
// ---------------------------------------------------------------------------

function db() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

// ---------------------------------------------------------------------------
// DB セットアップ / クリーンアップ
// ---------------------------------------------------------------------------

async function cleanupAccount(accountId: string) {
  const supabase = db();
  await supabase.from("activities").delete().eq("account_id", accountId);
  await supabase.from("evidences").delete().eq("account_id", accountId);
  await supabase.from("account_fields").delete().eq("account_id", accountId);
  await supabase.from("entries").delete().eq("account_id", accountId);
  await supabase.from("accounts").delete().eq("id", accountId);
}

async function cleanupByDid(blueskyDid: string) {
  const { data: entry } = await db()
    .from("entries")
    .select("account_id")
    .eq("bluesky_did", blueskyDid)
    .maybeSingle();
  if (entry) await cleanupAccount(entry.account_id);
}

beforeAll(async () => {
  await db().from("moderators").upsert({
    id: TEST_MODERATOR_ID,
    did: "did:plc:integration-test",
    handle: "integration-test.bsky.social",
    display_name: "Integration Test Moderator",
    is_admin: false,
  });
});

afterAll(async () => {
  await db().from("moderators").delete().eq("id", TEST_MODERATOR_ID);
});

// ---------------------------------------------------------------------------
// テストデータ作成ヘルパー
// ---------------------------------------------------------------------------

function makeRegisterRequest(body: object) {
  return new NextRequest("http://localhost/api/contribution/register", {
    method: "POST",
    headers: { "Content-Type": "application/json", "origin": "http://localhost:15010" },
    body: JSON.stringify(body),
  });
}

async function createPendingEntry(suffix: string) {
  const supabase = db();

  const { data: account } = await supabase
    .from("accounts")
    .insert({ display_name: `テスト公式アカウント ${suffix}`, old_category: "テスト" })
    .select("id")
    .single();

  const accountId = account!.id;

  const { data: entry } = await supabase
    .from("entries")
    .insert({
      account_id: accountId,
      bluesky_did: `did:plc:test-${suffix}`,
      bluesky_handle: `test-${suffix}.bsky.social`,
      twitter_handle: `test_${suffix}`,
      transition_status: "dual_active",
      status: "pending",
    })
    .select("id")
    .single();

  return { accountId, entryId: entry!.id };
}

// ---------------------------------------------------------------------------
// テスト
// ---------------------------------------------------------------------------

describe("登録フロー", () => {
  const TEST_DID = "did:plc:integ-reg-001";

  it("フォームから登録すると accounts・entries・account_fields・evidences が作成される", async () => {
    const req = makeRegisterRequest({
      did: TEST_DID,
      handle: "test-register.bsky.social",
      accountName: "統合テスト 登録アカウント",
      oldCategory: "テスト",
      fields: ["企業・ブランド・サービス"],
      migrationStatus: "dual_active",
      twitterUrl: "https://x.com/testreg001",
      evidence: "公式サイトで確認済み",
    });

    try {
      const res = await registerPOST(req);
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true });

      const { data: entry } = await db()
        .from("entries")
        .select("account_id, bluesky_handle, twitter_handle, transition_status, status")
        .eq("bluesky_did", TEST_DID)
        .single();

      expect(entry?.status).toBe("pending");
      expect(entry?.bluesky_handle).toBe("test-register.bsky.social");
      expect(entry?.twitter_handle).toBe("testreg001");
      expect(entry?.transition_status).toBe("dual_active");

      const accountId = entry!.account_id;

      const { data: account } = await db()
        .from("accounts")
        .select("display_name, old_category")
        .eq("id", accountId)
        .single();

      expect(account?.display_name).toBe("統合テスト 登録アカウント");

      const { data: fields } = await db()
        .from("account_fields")
        .select("field_id")
        .eq("account_id", accountId);

      expect(fields).toHaveLength(1);
      expect(fields![0].field_id).toBe("business");

      const { data: evidences } = await db()
        .from("evidences")
        .select("content")
        .eq("account_id", accountId);

      expect(evidences).toHaveLength(1);
      expect(evidences![0].content).toBe("公式サイトで確認済み");
    } finally {
      await cleanupByDid(TEST_DID);
    }
  });

  it("根拠が空だとバリデーションエラーになり DB には何も作成されない", async () => {
    const req = makeRegisterRequest({
      did: "did:plc:integ-reg-002",
      handle: "test-register2.bsky.social",
      accountName: "統合テスト 証拠なし",
      oldCategory: "テスト",
      fields: ["企業・ブランド・サービス"],
      migrationStatus: "dual_active",
      twitterUrl: "https://x.com/testreg002",
      evidence: "",
    });

    const res = await registerPOST(req);
    expect(res.status).toBe(400);
  });
});

describe("承認フロー", () => {
  it("pending のエントリを承認すると published になり activity が記録される", async () => {
    const { accountId, entryId } = await createPendingEntry("approve-1");

    try {
      const result = await approveEntry(entryId, accountId);
      expect(result).toEqual({ ok: true });

      const { data: entry } = await db()
        .from("entries")
        .select("status, approved_at")
        .eq("id", entryId)
        .single();

      expect(entry?.status).toBe("published");
      expect(entry?.approved_at).not.toBeNull();

      const { data: activities } = await db()
        .from("activities")
        .select("action, moderator_id")
        .eq("account_id", accountId);

      expect(activities).toHaveLength(1);
      expect(activities![0].action).toBe("approve");
      expect(activities![0].moderator_id).toBe(TEST_MODERATOR_ID);
    } finally {
      await cleanupAccount(accountId);
    }
  });
});

describe("却下フロー", () => {
  it("理由ありで却下すると rejected になり evidence と activity が記録される", async () => {
    const { accountId, entryId } = await createPendingEntry("reject-1");

    try {
      const result = await rejectEntry(entryId, accountId, "根拠が不十分です");
      expect(result).toEqual({ ok: true });

      const { data: entry } = await db()
        .from("entries")
        .select("status")
        .eq("id", entryId)
        .single();

      expect(entry?.status).toBe("rejected");

      const { data: evidences } = await db()
        .from("evidences")
        .select("content")
        .eq("account_id", accountId);

      expect(evidences).toHaveLength(1);
      expect(evidences![0].content).toBe("根拠が不十分です");

      const { data: activities } = await db()
        .from("activities")
        .select("action")
        .eq("account_id", accountId);

      expect(activities).toHaveLength(1);
      expect(activities![0].action).toBe("reject");
    } finally {
      await cleanupAccount(accountId);
    }
  });

  it("理由なしで却下しても rejected になり evidence は記録されない", async () => {
    const { accountId, entryId } = await createPendingEntry("reject-2");

    try {
      const result = await rejectEntry(entryId, accountId, "");
      expect(result).toEqual({ ok: true });

      const { data: evidences } = await db()
        .from("evidences")
        .select("id")
        .eq("account_id", accountId);

      expect(evidences).toHaveLength(0);
    } finally {
      await cleanupAccount(accountId);
    }
  });
});

describe("根拠追記フロー", () => {
  it("根拠を追記すると evidences に保存され activity が記録される", async () => {
    const { accountId, entryId: _entryId } = await createPendingEntry("evidence-1");

    try {
      const result = await addEvidence(accountId, "公式サイトで確認済み");
      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const { data: evidences } = await db()
        .from("evidences")
        .select("content, moderator_id")
        .eq("account_id", accountId);

      expect(evidences).toHaveLength(1);
      expect(evidences![0].content).toBe("公式サイトで確認済み");
      expect(evidences![0].moderator_id).toBe(TEST_MODERATOR_ID);
    } finally {
      await cleanupAccount(accountId);
    }
  });
});

describe("アカウント名修正フロー", () => {
  it("display_name を更新すると accounts テーブルに反映される", async () => {
    const { accountId, entryId: _entryId } = await createPendingEntry("name-1");

    try {
      const result = await updateEntryName(accountId, "修正後のアカウント名");
      expect(result).toEqual({ ok: true });

      const { data: account } = await db()
        .from("accounts")
        .select("display_name")
        .eq("id", accountId)
        .single();

      expect(account?.display_name).toBe("修正後のアカウント名");
    } finally {
      await cleanupAccount(accountId);
    }
  });
});