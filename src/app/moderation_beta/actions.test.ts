import { describe, it, expect, vi, beforeEach } from "vitest";

// --- モック ---

const mockDelete = vi.fn().mockReturnThis();
const mockUpdate = vi.fn().mockReturnThis();
const mockInsert = vi.fn().mockReturnThis();
const mockSelect = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockReturnThis();
const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null });
const mockSingle = vi.fn().mockResolvedValue({ data: { id: "new-id-1" } });
const mockRpc = vi.fn();

const mockFrom = vi.fn(() => ({
  delete: mockDelete,
  update: mockUpdate,
  insert: mockInsert,
  select: mockSelect,
  eq: mockEq,
  maybeSingle: mockMaybeSingle,
  single: mockSingle,
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ from: mockFrom, rpc: mockRpc })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockGetCurrentModerator = vi.fn();
vi.mock("src/lib/auth", () => ({
  getCurrentModerator: mockGetCurrentModerator,
  logout: vi.fn(),
}));

vi.stubEnv("SUPABASE_URL", "http://localhost:54321");
vi.stubEnv("SUPABASE_SECRET_KEY", "mock-secret-key");

const {
  approveEntrySubmission,
  rejectEntrySubmission,
  approveRequestSubmission,
  rejectRequestSubmission,
  updateSubmissionName,
  updateSubmissionTwitterUrl,
  updateSubmissionBlueskyHandle,
  updateSubmissionTransitionStatus,
  updateSubmissionEvidence,
  setSubmissionClassification,
} = await import("./actions");

const MOCK_MODERATOR = {
  id: "mod-1",
  handle: "testmod",
  display_name: "Test Mod",
  did: "did:plc:abc",
  is_admin: false,
  avatar: null,
  created_at: "2026-01-01T00:00:00Z",
};

const MOCK_SUBMISSION = {
  id: "sub-1",
  account_name: "テストアカウント",
  bluesky_did: "did:plc:test",
  bluesky_handle: "test.bsky.social",
  twitter_url: "https://x.com/testuser",
  field_id: "business",
  transition_status: "dual_active",
  evidence: "公式サイトで確認",
  classification_id: null,
  request_id: null,
  created_at: "2026-01-01T00:00:00Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockGetCurrentModerator.mockResolvedValue(MOCK_MODERATOR);

  // チェーンの再構築
  mockDelete.mockReturnValue({ eq: mockEq });
  mockUpdate.mockReturnValue({ eq: mockEq });
  mockInsert.mockReturnValue({ select: mockSelect, eq: mockEq });
  mockSelect.mockReturnValue({ eq: mockEq, single: mockSingle, maybeSingle: mockMaybeSingle });
  mockEq.mockReturnValue({ eq: mockEq, single: mockSingle, maybeSingle: mockMaybeSingle });
  mockMaybeSingle.mockResolvedValue({ data: null });
  mockSingle.mockResolvedValue({ data: MOCK_SUBMISSION });
  mockRpc.mockResolvedValue({ error: null });
});

// ---------------------------------------------------------------------------

// 承認の書き込みロジックは Postgres 関数（approve_entry_submission）に移動したため、
// 実際の DB 変換の正しさは統合テスト（tests/moderationFlow.integration.test.ts）が担う。
// ここでは server action の配線（認証・twitter_handle 解決・RPC 呼び出し）のみを確認する。
describe("approveEntrySubmission", () => {
  it("未ログインのとき、エラーを返す", async () => {
    mockGetCurrentModerator.mockResolvedValueOnce(null);
    const result = await approveEntrySubmission("sub-1");
    expect(result).toEqual({ ok: false, error: "ログインが必要です" });
  });

  it("申請が見つからないとき、エラーを返す", async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: new Error("not found") });
    const result = await approveEntrySubmission("sub-1");
    expect(result).toEqual({ ok: false, error: "申請が見つかりません" });
  });

  it("正常なとき、twitter_url を解決して approve_entry_submission RPC を呼ぶ", async () => {
    mockSingle.mockResolvedValueOnce({ data: { twitter_url: "https://x.com/testuser" } });
    const result = await approveEntrySubmission("sub-1");
    expect(result).toEqual({ ok: true });
    expect(mockRpc).toHaveBeenCalledWith(
      "approve_entry_submission",
      expect.objectContaining({ p_submission_id: "sub-1", p_moderator_id: MOCK_MODERATOR.id })
    );
  });

  it("RPC がエラーを返すとき、承認失敗を返す", async () => {
    mockSingle.mockResolvedValueOnce({ data: { twitter_url: null } });
    mockRpc.mockResolvedValueOnce({ error: new Error("boom") });
    const result = await approveEntrySubmission("sub-1");
    expect(result).toEqual({ ok: false, error: "承認に失敗しました" });
  });
});

// ---------------------------------------------------------------------------

describe("rejectEntrySubmission", () => {
  it("未ログインのとき、エラーを返す", async () => {
    mockGetCurrentModerator.mockResolvedValueOnce(null);
    const result = await rejectEntrySubmission("sub-1");
    expect(result).toEqual({ ok: false, error: "ログインが必要です" });
  });

  it("正常なとき、登録申請を削除する", async () => {
    const result = await rejectEntrySubmission("sub-1");
    expect(result).toEqual({ ok: true });
    expect(mockFrom).toHaveBeenCalledWith("entry_submissions");
    expect(mockDelete).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------

describe("approveRequestSubmission", () => {
  it("未ログインのとき、エラーを返す", async () => {
    mockGetCurrentModerator.mockResolvedValueOnce(null);
    const result = await approveRequestSubmission("req-sub-1");
    expect(result).toEqual({ ok: false, error: "ログインが必要です" });
  });

  it("正常なとき、approve_request_submission RPC を呼ぶ", async () => {
    const result = await approveRequestSubmission("req-sub-1");
    expect(result).toEqual({ ok: true });
    expect(mockRpc).toHaveBeenCalledWith("approve_request_submission", {
      p_submission_id: "req-sub-1",
      p_moderator_id: MOCK_MODERATOR.id,
    });
  });

  it("RPC がエラーを返すとき、承認失敗を返す", async () => {
    mockRpc.mockResolvedValueOnce({ error: new Error("boom") });
    const result = await approveRequestSubmission("req-sub-1");
    expect(result).toEqual({ ok: false, error: "承認に失敗しました" });
  });
});

// ---------------------------------------------------------------------------

describe("rejectRequestSubmission", () => {
  it("未ログインのとき、エラーを返す", async () => {
    mockGetCurrentModerator.mockResolvedValueOnce(null);
    const result = await rejectRequestSubmission("req-sub-1");
    expect(result).toEqual({ ok: false, error: "ログインが必要です" });
  });

  it("正常なとき、来て欲しいアカウント申請を削除する", async () => {
    const result = await rejectRequestSubmission("req-sub-1");
    expect(result).toEqual({ ok: true });
    expect(mockFrom).toHaveBeenCalledWith("request_submissions");
    expect(mockDelete).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------

describe("updateSubmissionName", () => {
  it("未ログインのとき、エラーを返す", async () => {
    mockGetCurrentModerator.mockResolvedValueOnce(null);
    const result = await updateSubmissionName("sub-1", "新しい名前");
    expect(result).toEqual({ ok: false, error: "ログインが必要です" });
  });

  it("正常なとき、アカウント名を更新する", async () => {
    const result = await updateSubmissionName("sub-1", "新しい名前");
    expect(result).toEqual({ ok: true });
    expect(mockFrom).toHaveBeenCalledWith("entry_submissions");
  });

  it("アカウント名が空のとき、エラーを返す", async () => {
    const result = await updateSubmissionName("sub-1", "");
    expect(result).toEqual({ ok: false, error: "アカウント名を入力してください" });
  });
});

// ---------------------------------------------------------------------------

describe("updateSubmissionTwitterUrl", () => {
  it("未ログインのとき、エラーを返す", async () => {
    mockGetCurrentModerator.mockResolvedValueOnce(null);
    const result = await updateSubmissionTwitterUrl("sub-1", "https://x.com/test");
    expect(result).toEqual({ ok: false, error: "ログインが必要です" });
  });

  it("正常なとき、Twitter/X の URL を更新する", async () => {
    const result = await updateSubmissionTwitterUrl("sub-1", "https://x.com/newhandle");
    expect(result).toEqual({ ok: true });
    expect(mockFrom).toHaveBeenCalledWith("entry_submissions");
    expect(mockUpdate).toHaveBeenCalledWith({ twitter_url: "https://x.com/newhandle" });
  });

  it("URL が空のとき、null として保存する", async () => {
    await updateSubmissionTwitterUrl("sub-1", "");
    expect(mockUpdate).toHaveBeenCalledWith({ twitter_url: null });
  });

  it("Twitter/X 以外の URL のとき、エラーを返す", async () => {
    const result = await updateSubmissionTwitterUrl("sub-1", "https://example.com/test");
    expect(result).toEqual({ ok: false, error: "Twitter/X のURLを入力してください" });
  });
});

// ---------------------------------------------------------------------------

describe("updateSubmissionBlueskyHandle", () => {
  it("ハンドルが空のとき、エラーを返す", async () => {
    const result = await updateSubmissionBlueskyHandle("sub-1", "");
    expect(result).toEqual({ ok: false, error: "Bluesky ハンドルを入力してください" });
  });

  it("正常なとき、Bluesky ハンドルを更新する", async () => {
    const result = await updateSubmissionBlueskyHandle("sub-1", "new.bsky.social");
    expect(result).toEqual({ ok: true });
  });
});

// ---------------------------------------------------------------------------

describe("updateSubmissionTransitionStatus", () => {
  it("ステータスが空のとき、エラーを返す", async () => {
    const result = await updateSubmissionTransitionStatus("sub-1", "");
    expect(result).toEqual({ ok: false, error: "ステータスを選択してください" });
  });

  it("正常なとき、移行ステータスを更新する", async () => {
    const result = await updateSubmissionTransitionStatus("sub-1", "migrated");
    expect(result).toEqual({ ok: true });
  });
});

// ---------------------------------------------------------------------------

describe("updateSubmissionEvidence", () => {
  it("未ログインのとき、エラーを返す", async () => {
    mockGetCurrentModerator.mockResolvedValueOnce(null);
    const result = await updateSubmissionEvidence("sub-1", "公式サイトで確認");
    expect(result).toEqual({ ok: false, error: "ログインが必要です" });
  });

  it("正常なとき、根拠を更新する", async () => {
    const result = await updateSubmissionEvidence("sub-1", "公式サイトで確認");
    expect(result).toEqual({ ok: true });
    expect(mockFrom).toHaveBeenCalledWith("entry_submissions");
    expect(mockUpdate).toHaveBeenCalledWith({ evidence: "公式サイトで確認" });
  });

  it("根拠が空のとき、null として保存する", async () => {
    await updateSubmissionEvidence("sub-1", "");
    expect(mockUpdate).toHaveBeenCalledWith({ evidence: null });
  });
});

// ---------------------------------------------------------------------------

describe("setSubmissionClassification", () => {
  it("未ログインのとき、エラーを返す", async () => {
    mockGetCurrentModerator.mockResolvedValueOnce(null);
    const result = await setSubmissionClassification("sub-1", "a1b2c3d4-e5f6-4a7b-8c9d-000000000001");
    expect(result).toEqual({ ok: false, error: "ログインが必要です" });
  });

  it("正常なとき、分類を更新する", async () => {
    const result = await setSubmissionClassification("sub-1", "a1b2c3d4-e5f6-4a7b-8c9d-000000000001");
    expect(result).toEqual({ ok: true });
    expect(mockFrom).toHaveBeenCalledWith("entry_submissions");
  });

  it("分類が未設定のとき、null として保存する", async () => {
    await setSubmissionClassification("sub-1", "");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ classification_id: null })
    );
  });
});
