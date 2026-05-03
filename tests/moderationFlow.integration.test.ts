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
const { approveEntrySubmission, rejectEntrySubmission, updateSubmissionName } =
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

async function cleanupSubmissionByDid(blueskyDid: string) {
  await db().from("entry_submissions").delete().eq("bluesky_did", blueskyDid);
}

async function cleanupByDid(blueskyDid: string) {
  const { data: entry } = await db()
    .from("entries")
    .select("account_id")
    .eq("bluesky_did", blueskyDid)
    .maybeSingle();
  if (entry) await cleanupAccount(entry.account_id);
  await cleanupSubmissionByDid(blueskyDid);
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

async function createPendingSubmission(suffix: string) {
  const { data: submission } = await db()
    .from("entry_submissions")
    .insert({
      account_name: `テスト公式アカウント ${suffix}`,
      bluesky_did: `did:plc:test-${suffix}`,
      bluesky_handle: `test-${suffix}.bsky.social`,
      twitter_url: `https://x.com/test_${suffix}`,
      field_id: "business",
      transition_status: "dual_active",
      evidence: "テスト用根拠",
    })
    .select("id")
    .single();

  return {
    submissionId: submission!.id,
    blueskyDid: `did:plc:test-${suffix}`,
  };
}

// ---------------------------------------------------------------------------
// テスト
// ---------------------------------------------------------------------------

describe("登録フロー", () => {
  const TEST_DID = "did:plc:integ-reg-001";

  it("フォームから登録すると entry_submissions にレコードが作成される", async () => {
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

      const { data: submission } = await db()
        .from("entry_submissions")
        .select("account_name, bluesky_handle, twitter_url, transition_status, field_id, evidence")
        .eq("bluesky_did", TEST_DID)
        .single();

      expect(submission?.account_name).toBe("統合テスト 登録アカウント");
      expect(submission?.bluesky_handle).toBe("test-register.bsky.social");
      expect(submission?.twitter_url).toBe("https://x.com/testreg001");
      expect(submission?.transition_status).toBe("dual_active");
      expect(submission?.field_id).toBe("business");
      expect(submission?.evidence).toBe("公式サイトで確認済み");
    } finally {
      await cleanupSubmissionByDid(TEST_DID);
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
  it("申請を承認すると accounts・entries・account_fields・evidences が作成され申請が削除される", async () => {
    const { submissionId, blueskyDid } = await createPendingSubmission("approve-1");

    try {
      const result = await approveEntrySubmission(submissionId);
      expect(result).toEqual({ ok: true });

      // entry_submissions は削除されているはず
      const { data: deleted } = await db()
        .from("entry_submissions")
        .select("id")
        .eq("id", submissionId)
        .maybeSingle();
      expect(deleted).toBeNull();

      // entries が作成されているはず
      const { data: entry } = await db()
        .from("entries")
        .select("account_id, bluesky_handle, transition_status, approved_at")
        .eq("bluesky_did", blueskyDid)
        .single();

      expect(entry?.bluesky_handle).toBe("test-approve-1.bsky.social");
      expect(entry?.transition_status).toBe("dual_active");
      expect(entry?.approved_at).not.toBeNull();

      const accountId = entry!.account_id;

      // accounts が作成されているはず
      const { data: account } = await db()
        .from("accounts")
        .select("display_name")
        .eq("id", accountId)
        .single();
      expect(account?.display_name).toBe("テスト公式アカウント approve-1");

      // account_fields が作成されているはず
      const { data: fields } = await db()
        .from("account_fields")
        .select("field_id")
        .eq("account_id", accountId);
      expect(fields).toHaveLength(1);
      expect(fields![0].field_id).toBe("business");

      // evidences が作成されているはず
      const { data: evidences } = await db()
        .from("evidences")
        .select("content")
        .eq("account_id", accountId);
      expect(evidences).toHaveLength(1);
      expect(evidences![0].content).toBe("テスト用根拠");

      // activities が記録されているはず
      const { data: activities } = await db()
        .from("activities")
        .select("action, moderator_id")
        .eq("account_id", accountId);
      expect(activities).toHaveLength(1);
      expect(activities![0].action).toBe("approve");
      expect(activities![0].moderator_id).toBe(TEST_MODERATOR_ID);
    } finally {
      await cleanupByDid(blueskyDid);
    }
  });
});

describe("却下フロー", () => {
  it("申請を却下すると entry_submissions のレコードが削除される", async () => {
    const { submissionId } = await createPendingSubmission("reject-1");

    const result = await rejectEntrySubmission(submissionId);
    expect(result).toEqual({ ok: true });

    const { data: submission } = await db()
      .from("entry_submissions")
      .select("id")
      .eq("id", submissionId)
      .maybeSingle();
    expect(submission).toBeNull();
  });
});

describe("分野追加フロー (A06承認・D05)", () => {
  it("既存アカウントで別分野の申請を承認すると、新しい account_fields が追加され既存分野は維持される", async () => {
    const blueskyDid = "did:plc:test-d05-1";

    // 1. business 分野に既存アカウントを作成
    const { data: account } = await db()
      .from("accounts")
      .insert({ display_name: "D05 テストアカウント" })
      .select("id")
      .single();
    const accountId = account!.id;

    await db().from("entries").insert({
      account_id: accountId,
      bluesky_did: blueskyDid,
      bluesky_handle: "d05-test.bsky.social",
      transition_status: "dual_active",
      approved_at: new Date().toISOString(),
    });
    await db().from("account_fields").insert({ account_id: accountId, field_id: "business" });

    // 2. 同じ DID で tech 分野への申請を作成（A06相当）
    const { data: submission } = await db()
      .from("entry_submissions")
      .insert({
        account_name: "D05 テストアカウント（更新）",
        bluesky_did: blueskyDid,
        bluesky_handle: "d05-test.bsky.social",
        field_id: "tech",
        transition_status: "migrated",
        evidence: "D05 テスト用根拠",
      })
      .select("id")
      .single();
    const submissionId = submission!.id;

    try {
      const result = await approveEntrySubmission(submissionId);
      expect(result).toEqual({ ok: true });

      // entry_submissions は削除されているはず
      const { data: deletedSub } = await db()
        .from("entry_submissions").select("id").eq("id", submissionId).maybeSingle();
      expect(deletedSub).toBeNull();

      // entries は新規作成されず、更新されているはず
      const { data: allEntries } = await db()
        .from("entries").select("transition_status").eq("bluesky_did", blueskyDid);
      expect(allEntries).toHaveLength(1);
      expect(allEntries![0].transition_status).toBe("migrated");

      // business と tech の両方の account_fields が存在するはず
      const { data: fields } = await db()
        .from("account_fields").select("field_id").eq("account_id", accountId);
      const fieldIds = fields!.map((f) => f.field_id).sort();
      expect(fieldIds).toContain("business");
      expect(fieldIds).toContain("tech");
      expect(fields).toHaveLength(2);
    } finally {
      await cleanupAccount(accountId);
    }
  });
});

describe("アカウント名修正フロー", () => {
  it("account_name を更新すると entry_submissions に反映される", async () => {
    const { submissionId } = await createPendingSubmission("name-1");

    try {
      const result = await updateSubmissionName(submissionId, "修正後のアカウント名");
      expect(result).toEqual({ ok: true });

      const { data: submission } = await db()
        .from("entry_submissions")
        .select("account_name")
        .eq("id", submissionId)
        .single();

      expect(submission?.account_name).toBe("修正後のアカウント名");
    } finally {
      await db().from("entry_submissions").delete().eq("id", submissionId);
    }
  });
});
