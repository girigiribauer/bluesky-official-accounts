import { describe, it, expect, vi, beforeEach } from "vitest";

// --- モック ---

const mockDelete = vi.fn().mockReturnThis();
const mockUpdate = vi.fn().mockReturnThis();
const mockInsert = vi.fn().mockReturnThis();
const mockSelect = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockReturnThis();
const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null });
const mockSingle = vi.fn().mockResolvedValue({ data: { id: "new-id-1" } });

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
  createClient: vi.fn(() => ({ from: mockFrom })),
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
  old_category: null,
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
});

// ---------------------------------------------------------------------------

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

  it("DIDが未登録のとき、アカウント・エントリー・分野を新規作成して申請を削除する", async () => {
    const accountData = { id: "account-new-1" };
    const entryData = { id: "entry-new-1" };
    mockSingle
      .mockResolvedValueOnce({ data: MOCK_SUBMISSION })  // 申請取得
      .mockResolvedValueOnce({ data: accountData })       // アカウント作成
      .mockResolvedValueOnce({ data: entryData });        // エントリー作成

    const result = await approveEntrySubmission("sub-1");
    expect(result).toEqual({ ok: true });
    expect(mockFrom).toHaveBeenCalledWith("entry_submissions");
    expect(mockFrom).toHaveBeenCalledWith("accounts");
    expect(mockFrom).toHaveBeenCalledWith("entries");
    expect(mockFrom).toHaveBeenCalledWith("account_fields");
  });

  it("DIDが登録済みかつ同じ分野のとき、エントリーとアカウントを更新し新規作成しない", async () => {
    const existingEntry = { id: "existing-entry-1", account_id: "existing-account-1" };
    // 1回目: エントリーで既存DID確認、2回目: 分野で同じ field_id 確認
    mockMaybeSingle
      .mockResolvedValueOnce({ data: existingEntry })                  // 既存エントリー
      .mockResolvedValueOnce({ data: { field_id: "business" } });      // 同じ分野が存在

    const result = await approveEntrySubmission("sub-1");
    expect(result).toEqual({ ok: true });
    expect(mockUpdate).toHaveBeenCalled();
    // アカウント・エントリーの新規作成は呼ばれない（.single() は申請取得の1回のみ）
    expect(mockSingle).toHaveBeenCalledTimes(1);
  });

  it("DIDが登録済みかつ来て欲しいリストと紐付いているとき、来て欲しいリストから削除する", async () => {
    const existingEntry = { id: "existing-entry-1", account_id: "existing-account-1" };
    const submissionWithRequest = { ...MOCK_SUBMISSION, request_id: "req-1" };
    mockSingle.mockResolvedValueOnce({ data: submissionWithRequest });
    mockMaybeSingle
      .mockResolvedValueOnce({ data: existingEntry })
      .mockResolvedValueOnce({ data: { field_id: "business" } });

    const result = await approveEntrySubmission("sub-1");
    expect(result).toEqual({ ok: true });
    expect(mockFrom).toHaveBeenCalledWith("requests");
    expect(mockDelete).toHaveBeenCalled();
  });

  it("DIDが登録済みで分野が異なるとき、新しい分野を追加する", async () => {
    const existingEntry = { id: "existing-entry-1", account_id: "existing-account-1" };
    // 1回目: エントリーで既存DID確認、2回目: 同じ分野が存在しない
    mockMaybeSingle
      .mockResolvedValueOnce({ data: existingEntry }) // 既存エントリー
      .mockResolvedValueOnce({ data: null });          // 別の分野 → 見つからない

    const result = await approveEntrySubmission("sub-1");
    expect(result).toEqual({ ok: true });
    expect(mockFrom).toHaveBeenCalledWith("account_fields");
    expect(mockInsert).toHaveBeenCalled();
    // アカウント・エントリーの新規作成は呼ばれない
    expect(mockSingle).toHaveBeenCalledTimes(1);
  });

  it("DIDが未登録かつ来て欲しいリストと紐付いているとき、来て欲しいリストから削除する", async () => {
    const submissionWithRequest = { ...MOCK_SUBMISSION, request_id: "req-1" };
    mockSingle
      .mockResolvedValueOnce({ data: submissionWithRequest }) // 申請取得
      .mockResolvedValueOnce({ data: { id: "new-account-1" } }) // アカウント作成
      .mockResolvedValueOnce({ data: { id: "new-entry-1" } }); // エントリー作成

    const result = await approveEntrySubmission("sub-1");
    expect(result).toEqual({ ok: true });
    expect(mockFrom).toHaveBeenCalledWith("requests");
    expect(mockDelete).toHaveBeenCalled();
  });

  it("根拠があるとき、承認者を紐付けて根拠を追加する", async () => {
    mockSingle
      .mockResolvedValueOnce({ data: MOCK_SUBMISSION })
      .mockResolvedValueOnce({ data: { id: "account-new-1" } })
      .mockResolvedValueOnce({ data: { id: "entry-new-1" } });

    await approveEntrySubmission("sub-1");

    expect(mockFrom).toHaveBeenCalledWith("evidences");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ moderator_id: MOCK_MODERATOR.id })
    );
  });

  it("根拠が空のとき、根拠を追加しない", async () => {
    const submissionWithoutEvidence = { ...MOCK_SUBMISSION, evidence: "" };
    mockSingle
      .mockResolvedValueOnce({ data: submissionWithoutEvidence })
      .mockResolvedValueOnce({ data: { id: "account-new-1" } })
      .mockResolvedValueOnce({ data: { id: "entry-new-1" } });

    await approveEntrySubmission("sub-1");

    expect(mockFrom).not.toHaveBeenCalledWith("evidences");
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
  const MOCK_REQUEST_SUBMISSION = {
    id: "req-sub-1",
    display_name: "テストアカウント",
    twitter_handle: "testuser",
    created_at: "2026-01-01T00:00:00Z",
  };

  it("未ログインのとき、エラーを返す", async () => {
    mockGetCurrentModerator.mockResolvedValueOnce(null);
    const result = await approveRequestSubmission("req-sub-1");
    expect(result).toEqual({ ok: false, error: "ログインが必要です" });
  });

  it("正常なとき、アカウントと来て欲しいリストを作成して申請を削除する", async () => {
    const accountData = { id: "account-new-2" };
    mockSingle
      .mockResolvedValueOnce({ data: MOCK_REQUEST_SUBMISSION })  // 申請取得
      .mockResolvedValueOnce({ data: accountData });              // アカウント作成

    const result = await approveRequestSubmission("req-sub-1");
    expect(result).toEqual({ ok: true });
    expect(mockFrom).toHaveBeenCalledWith("request_submissions");
    expect(mockFrom).toHaveBeenCalledWith("accounts");
    expect(mockFrom).toHaveBeenCalledWith("requests");
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
