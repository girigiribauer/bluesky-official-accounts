/**
 * 統合テスト: 登録〜モデレーションフロー
 *
 * 実際のローカル Supabase DB に対して動作する。
 * モックするのは Next.js 依存と CSRF・レート制限のみ。
 * DB 操作（Supabase クライアント）は本物を使う。
 *
 * 前提: supabase start でローカル DB が起動していること。
 */
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
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
const { POST: requestPOST } = await import("src/app/(public)/api/contribution/request/route");
const { approveEntrySubmission, rejectEntrySubmission, updateSubmissionName, approveRequestSubmission, rejectRequestSubmission, joinField, updateFieldLastActive } =
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
  await supabase.from("activities").delete().eq("moderator_id", TEST_MODERATOR_ID);
  await supabase.from("evidences").delete().eq("account_id", accountId);
  await supabase.from("account_fields").delete().eq("account_id", accountId);
  await supabase.from("entries").delete().eq("account_id", accountId);
  await supabase.from("requests").delete().eq("account_id", accountId);
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
      account_name: `[テスト] 公式アカウント ${suffix}`,
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
      fields: ["business"],
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

  it("根拠が空でも登録できる", async () => {
    const did = "did:plc:integ-reg-002";
    const req = makeRegisterRequest({
      did,
      handle: "test-register2.bsky.social",
      accountName: "統合テスト 証拠なし",
      fields: ["business"],
      migrationStatus: "dual_active",
      twitterUrl: "https://x.com/testreg002",
      evidence: "",
    });

    try {
      const res = await registerPOST(req);
      expect(res.status).toBe(200);
    } finally {
      await cleanupSubmissionByDid(did);
    }
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
      expect(account?.display_name).toBe("[テスト] 公式アカウント approve-1");

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
        .select("action, moderator_id, payload")
        .eq("moderator_id", TEST_MODERATOR_ID)
        .eq("action", "approve");
      expect(activities).toHaveLength(1);
      expect(activities![0].action).toBe("approve");
      expect(activities![0].moderator_id).toBe(TEST_MODERATOR_ID);
      const approvePayload = activities![0].payload as { account_id: string; display_name: string; field_id: string };
      expect(approvePayload.account_id).toBe(accountId);
      expect(approvePayload.display_name).toBe("[テスト] 公式アカウント approve-1");
      expect(approvePayload.field_id).toBe("business");
    } finally {
      await cleanupByDid(blueskyDid);
    }
  });
});

describe("却下フロー", () => {
  it("申請を却下すると entry_submissions が削除され activities に記録される", async () => {
    const { submissionId } = await createPendingSubmission("reject-1");

    try {
      const result = await rejectEntrySubmission(submissionId);
      expect(result).toEqual({ ok: true });

      // entry_submissions は削除されているはず
      const { data: submission } = await db()
        .from("entry_submissions")
        .select("id")
        .eq("id", submissionId)
        .maybeSingle();
      expect(submission).toBeNull();

      // activities に reject が記録されているはず
      const { data: activities } = await db()
        .from("activities")
        .select("action, moderator_id, payload")
        .eq("moderator_id", TEST_MODERATOR_ID)
        .eq("action", "reject");
      expect(activities).toHaveLength(1);
      expect(activities![0].moderator_id).toBe(TEST_MODERATOR_ID);
      const rejectPayload = activities![0].payload as { submission_id: string; submission_type: string; display_name: string; field_id: string };
      expect(rejectPayload.submission_id).toBe(submissionId);
      expect(rejectPayload.submission_type).toBe("entry");
      expect(rejectPayload.display_name).toBe("[テスト] 公式アカウント reject-1");
      expect(rejectPayload.field_id).toBe("business");
    } finally {
      await db().from("activities").delete().eq("moderator_id", TEST_MODERATOR_ID);
    }
  });
});

describe("分野追加フロー (A06承認・D05)", () => {
  it("既存アカウントで別分野の申請を承認すると、新しい account_fields が追加され既存分野は維持される", async () => {
    const blueskyDid = "did:plc:test-d05-1";

    // 1. business 分野に既存アカウントを作成
    const { data: account } = await db()
      .from("accounts")
      .insert({ display_name: "[テスト] D05アカウント" })
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
        account_name: "[テスト] D05アカウント（更新）",
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
      await db().from("entry_submissions").delete().eq("id", submissionId);
      await cleanupAccount(accountId);
    }
  });
});

describe("来て欲しい申請フロー", () => {
  function makeRequestSubmissionRequest(body: object) {
    return new NextRequest("http://localhost/api/contribution/request", {
      method: "POST",
      headers: { "Content-Type": "application/json", "origin": "http://localhost:15010" },
      body: JSON.stringify(body),
    });
  }

  it("フォームから申請すると request_submissions にレコードが作成される（field_id 含む）", async () => {
    const twitterHandle = "test_req_001";
    const twitterUrl = `https://x.com/${twitterHandle}`;

    try {
      const req = makeRequestSubmissionRequest({
        twitterUrl,
        twitterName: "[テスト] 来てほしいアカウント",
        fieldId: "tech",
      });
      const res = await requestPOST(req);
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true });

      const { data: submission } = await db()
        .from("request_submissions")
        .select("display_name, twitter_handle, field_id")
        .eq("twitter_handle", twitterHandle)
        .single();

      expect(submission?.display_name).toBe("[テスト] 来てほしいアカウント");
      expect(submission?.twitter_handle).toBe(twitterHandle);
      expect(submission?.field_id).toBe("tech");
    } finally {
      await db().from("request_submissions").delete().eq("twitter_handle", twitterHandle);
    }
  });

  it("field_id なしの申請は 400 を返す", async () => {
    const req = makeRequestSubmissionRequest({
      twitterUrl: "https://x.com/test_req_nofield",
      twitterName: "[テスト] フィールドなし",
    });
    const res = await requestPOST(req);
    expect(res.status).toBe(400);
  });

  it("申請を承認すると requests に field_id が保存され、活動ログに記録される", async () => {
    const twitterHandle = "test_req_approve";
    const { data: submission } = await db()
      .from("request_submissions")
      .insert({
        display_name: "[テスト] 来てほしい承認アカウント",
        twitter_handle: twitterHandle,
        field_id: "entertainment",
      })
      .select("id")
      .single();
    const submissionId = submission!.id;

    try {
      const result = await approveRequestSubmission(submissionId);
      expect(result).toEqual({ ok: true });

      // request_submissions は削除されているはず
      const { data: deleted } = await db()
        .from("request_submissions")
        .select("id")
        .eq("id", submissionId)
        .maybeSingle();
      expect(deleted).toBeNull();

      // requests に field_id が保存されているはず
      const { data: request } = await db()
        .from("requests")
        .select("twitter_handle, field_id, account_id")
        .eq("twitter_handle", twitterHandle)
        .single();
      expect(request?.field_id).toBe("entertainment");

      // activities に記録されているはず
      const { data: activities } = await db()
        .from("activities")
        .select("payload")
        .eq("moderator_id", TEST_MODERATOR_ID)
        .eq("action", "approve");
      expect(activities).toHaveLength(1);
      const payload = activities![0].payload as { field_id: string; display_name: string };
      expect(payload.field_id).toBe("entertainment");
      expect(payload.display_name).toBe("[テスト] 来てほしい承認アカウント");

      // cleanup
      if (request?.account_id) await cleanupAccount(request.account_id);
    } finally {
      await db().from("activities").delete().eq("moderator_id", TEST_MODERATOR_ID);
      await db().from("request_submissions").delete().eq("id", submissionId);
    }
  });

  it("承認が途中で失敗したとき、トランザクションで全てロールバックされる（account が残らない）", async () => {
    // 同じ twitter_handle の requests を先に作っておき、承認時の requests insert で
    // UNIQUE 違反を起こす。関数は「account 作成 → requests 作成(ここで失敗)」の順なので、
    // トランザクションが無ければ account だけが残ってしまう。
    const twitterHandle = "test_atomic_rollback";
    const orphanName = "[テスト] 原子性ロールバック";

    const { data: blocker } = await db()
      .from("accounts")
      .insert({ display_name: "[テスト] 原子性ブロッカー" })
      .select("id")
      .single();
    const blockerAccountId = blocker!.id;
    await db().from("requests").insert({ account_id: blockerAccountId, twitter_handle: twitterHandle });

    const { data: submission } = await db()
      .from("request_submissions")
      .insert({ display_name: orphanName, twitter_handle: twitterHandle, field_id: "tech" })
      .select("id")
      .single();
    const submissionId = submission!.id;

    try {
      const result = await approveRequestSubmission(submissionId);
      expect(result).toEqual({ ok: false, error: "承認に失敗しました" });

      // ロールバックの証拠: 途中で作られたはずの account が残っていない
      const { data: orphan } = await db()
        .from("accounts")
        .select("id")
        .eq("display_name", orphanName)
        .maybeSingle();
      expect(orphan).toBeNull();

      // 申請も削除されていない（失敗したので消えていないこと）
      const { data: stillThere } = await db()
        .from("request_submissions")
        .select("id")
        .eq("id", submissionId)
        .maybeSingle();
      expect(stillThere).not.toBeNull();
    } finally {
      await db().from("request_submissions").delete().eq("id", submissionId);
      await db().from("requests").delete().eq("account_id", blockerAccountId);
      await db().from("accounts").delete().eq("id", blockerAccountId);
    }
  });

  it("申請を却下すると request_submissions が削除され、field_id が活動ログに記録される", async () => {
    const { data: submission } = await db()
      .from("request_submissions")
      .insert({
        display_name: "[テスト] 来てほしい却下アカウント",
        twitter_handle: "test_req_reject",
        field_id: "music",
      })
      .select("id")
      .single();
    const submissionId = submission!.id;

    try {
      const result = await rejectRequestSubmission(submissionId);
      expect(result).toEqual({ ok: true });

      // request_submissions は削除されているはず
      const { data: deleted } = await db()
        .from("request_submissions")
        .select("id")
        .eq("id", submissionId)
        .maybeSingle();
      expect(deleted).toBeNull();

      // activities に field_id が記録されているはず
      const { data: activities } = await db()
        .from("activities")
        .select("payload")
        .eq("moderator_id", TEST_MODERATOR_ID)
        .eq("action", "reject");
      expect(activities).toHaveLength(1);
      const payload = activities![0].payload as { submission_type: string; display_name: string; field_id: string };
      expect(payload.submission_type).toBe("request");
      expect(payload.display_name).toBe("[テスト] 来てほしい却下アカウント");
      expect(payload.field_id).toBe("music");
    } finally {
      await db().from("activities").delete().eq("moderator_id", TEST_MODERATOR_ID);
      await db().from("request_submissions").delete().eq("id", submissionId);
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

// ---------------------------------------------------------------------------
// B シナリオ: 認証・オンボーディングフロー
// ---------------------------------------------------------------------------

describe("分野参加フロー (B01/B03)", () => {
  afterEach(async () => {
    await db().from("field_memberships").delete().eq("moderator_id", TEST_MODERATOR_ID);
  });

  it("未参加の分野に joinField すると field_memberships にレコードが作成される（B01）", async () => {
    const before = new Date();

    const result = await joinField("tech");
    expect(result).toEqual({ ok: true });

    const { data } = await db()
      .from("field_memberships")
      .select("field_id, last_active_at")
      .eq("moderator_id", TEST_MODERATOR_ID)
      .eq("field_id", "tech")
      .single();

    expect(data?.field_id).toBe("tech");
    expect(new Date(data!.last_active_at) >= before).toBe(true);
  });

  it("既参加の分野がある状態で別の分野に joinField すると新規レコードが追加され既存は維持される（B03）", async () => {
    await joinField("business");

    const result = await joinField("tech");
    expect(result).toEqual({ ok: true });

    const { data } = await db()
      .from("field_memberships")
      .select("field_id")
      .eq("moderator_id", TEST_MODERATOR_ID);

    const fieldIds = (data ?? []).map((m) => m.field_id);
    expect(fieldIds).toContain("business");
    expect(fieldIds).toContain("tech");
    expect(data).toHaveLength(2);
  });

  it("既参加の分野に再度 joinField すると last_active_at が更新され、レコードは増えない", async () => {
    await joinField("tech");

    const { data: first } = await db()
      .from("field_memberships")
      .select("last_active_at")
      .eq("moderator_id", TEST_MODERATOR_ID)
      .eq("field_id", "tech")
      .single();

    await new Promise((r) => setTimeout(r, 20));

    await joinField("tech");

    const { data: second } = await db()
      .from("field_memberships")
      .select("last_active_at")
      .eq("moderator_id", TEST_MODERATOR_ID)
      .eq("field_id", "tech")
      .single();

    // last_active_at が更新されているはず
    expect(new Date(second!.last_active_at) > new Date(first!.last_active_at)).toBe(true);

    // upsert なのでレコードは1件のまま
    const { data: all } = await db()
      .from("field_memberships")
      .select("id")
      .eq("moderator_id", TEST_MODERATOR_ID)
      .eq("field_id", "tech");
    expect(all).toHaveLength(1);
  });
});

describe("分野切り替えフロー (B04)", () => {
  afterEach(async () => {
    await db().from("field_memberships").delete().eq("moderator_id", TEST_MODERATOR_ID);
  });

  it("updateFieldLastActive を呼ぶと対象分野の last_active_at が更新され、他分野は変わらない", async () => {
    // business → tech の順に参加（tech の方が last_active_at が新しい）
    await joinField("business");
    await new Promise((r) => setTimeout(r, 20));
    await joinField("tech");

    const { data: techBefore } = await db()
      .from("field_memberships")
      .select("last_active_at")
      .eq("moderator_id", TEST_MODERATOR_ID)
      .eq("field_id", "tech")
      .single();

    // 少し経ってから business に切り替え
    await new Promise((r) => setTimeout(r, 20));
    await updateFieldLastActive("business");

    const { data: businessAfter } = await db()
      .from("field_memberships")
      .select("last_active_at")
      .eq("moderator_id", TEST_MODERATOR_ID)
      .eq("field_id", "business")
      .single();

    const { data: techAfter } = await db()
      .from("field_memberships")
      .select("last_active_at")
      .eq("moderator_id", TEST_MODERATOR_ID)
      .eq("field_id", "tech")
      .single();

    // business が tech より新しくなっているはず（切り替えたので）
    expect(new Date(businessAfter!.last_active_at) > new Date(techAfter!.last_active_at)).toBe(true);

    // tech の last_active_at は変わっていないはず
    expect(techAfter!.last_active_at).toBe(techBefore!.last_active_at);
  });
});

// ---------------------------------------------------------------------------
// D02: 既存アカウントの情報更新承認
// ---------------------------------------------------------------------------

describe("既存アカウント情報更新フロー (D02)", () => {
  it("同じ DID・同じ分野の申請を承認すると entries が更新され新規作成されない", async () => {
    const blueskyDid = "did:plc:test-d02-1";

    const { data: account } = await db()
      .from("accounts")
      .insert({ display_name: "[テスト] D02アカウント" })
      .select("id")
      .single();
    const accountId = account!.id;

    await db().from("entries").insert({
      account_id: accountId,
      bluesky_did: blueskyDid,
      bluesky_handle: "d02-old.bsky.social",
      transition_status: "dual_active",
      approved_at: new Date().toISOString(),
    });
    await db().from("account_fields").insert({ account_id: accountId, field_id: "business" });

    const { data: submission } = await db()
      .from("entry_submissions")
      .insert({
        account_name: "[テスト] D02アカウント（更新後）",
        bluesky_did: blueskyDid,
        bluesky_handle: "d02-new.bsky.social",
        field_id: "business",
        transition_status: "migrated",
      })
      .select("id")
      .single();
    const submissionId = submission!.id;

    try {
      const result = await approveEntrySubmission(submissionId);
      expect(result).toEqual({ ok: true });

      // entries は1件のまま（新規作成されない）
      const { data: allEntries } = await db()
        .from("entries")
        .select("bluesky_handle, transition_status")
        .eq("bluesky_did", blueskyDid);
      expect(allEntries).toHaveLength(1);
      expect(allEntries![0].bluesky_handle).toBe("d02-new.bsky.social");
      expect(allEntries![0].transition_status).toBe("migrated");

      // entry_submissions は削除されているはず
      const { data: deleted } = await db()
        .from("entry_submissions")
        .select("id")
        .eq("id", submissionId)
        .maybeSingle();
      expect(deleted).toBeNull();
    } finally {
      await db().from("entry_submissions").delete().eq("id", submissionId);
      await cleanupAccount(accountId);
    }
  });
});

// ---------------------------------------------------------------------------
// D03: 来て欲しいリストと紐付いた申請の承認
// ---------------------------------------------------------------------------

describe("来て欲しいリスト紐付き承認フロー (D03)", () => {
  it("request_id 付き申請を承認すると requests レコードが削除される", async () => {
    const blueskyDid = "did:plc:test-d03-1";

    // 来て欲しいリスト用のアカウント + requests を作成
    const { data: requestAccount } = await db()
      .from("accounts")
      .insert({ display_name: "[テスト] D03 来て欲しいアカウント" })
      .select("id")
      .single();
    const requestAccountId = requestAccount!.id;

    const { data: request } = await db()
      .from("requests")
      .insert({ account_id: requestAccountId, twitter_handle: "d03_test_user", field_id: "tech" })
      .select("id")
      .single();
    const requestId = request!.id;

    // request_id 付きの登録申請を作成
    const { data: submission } = await db()
      .from("entry_submissions")
      .insert({
        account_name: "[テスト] D03アカウント",
        bluesky_did: blueskyDid,
        bluesky_handle: "d03-test.bsky.social",
        field_id: "tech",
        transition_status: "migrated",
        request_id: requestId,
      })
      .select("id")
      .single();
    const submissionId = submission!.id;

    try {
      const result = await approveEntrySubmission(submissionId);
      expect(result).toEqual({ ok: true });

      // requests レコードが削除されているはず
      const { data: deletedRequest } = await db()
        .from("requests")
        .select("id")
        .eq("id", requestId)
        .maybeSingle();
      expect(deletedRequest).toBeNull();

      // entry_submissions も削除されているはず
      const { data: deletedSub } = await db()
        .from("entry_submissions")
        .select("id")
        .eq("id", submissionId)
        .maybeSingle();
      expect(deletedSub).toBeNull();

      // entries + account_fields が作成されているはず
      const { data: entry } = await db()
        .from("entries")
        .select("account_id")
        .eq("bluesky_did", blueskyDid)
        .single();
      expect(entry).not.toBeNull();
    } finally {
      await db().from("entry_submissions").delete().eq("id", submissionId);
      await db().from("requests").delete().eq("id", requestId);
      await cleanupByDid(blueskyDid);
      await db().from("accounts").delete().eq("id", requestAccountId);
      await db().from("activities").delete().eq("moderator_id", TEST_MODERATOR_ID);
    }
  });
});
