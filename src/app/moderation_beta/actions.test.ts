import { describe, it, expect, vi, beforeEach } from "vitest";

// --- モック ---

const mockUpdate = vi.fn().mockReturnThis();
const mockInsert = vi.fn().mockReturnThis();
const mockSelect = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockReturnThis();
const mockSingle = vi.fn().mockResolvedValue({ data: { id: "evidence-id-1" } });

const mockFrom = vi.fn(() => ({
  update: mockUpdate,
  insert: mockInsert,
  select: mockSelect,
  eq: mockEq,
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
  approveEntry,
  rejectEntry,
  updateEntryName,
  updateEntryTwitterHandle,
  updateEntryBlueskyHandle,
  updateEntryStatus,
  setEntryClassification,
  addEvidence,
} = await import("./actions");

const MOCK_MODERATOR = { id: "mod-1", handle: "testmod", display_name: "Test Mod", did: "did:plc:abc", is_admin: false, avatar: null, created_at: "2026-01-01T00:00:00Z" };

beforeEach(() => {
  vi.clearAllMocks();
  mockGetCurrentModerator.mockResolvedValue(MOCK_MODERATOR);

  // チェーンの再構築
  mockUpdate.mockReturnValue({ eq: mockEq });
  mockInsert.mockReturnValue({ select: mockSelect, eq: mockEq });
  mockSelect.mockReturnValue({ eq: mockEq, single: mockSingle });
  mockEq.mockReturnValue({ eq: mockEq, single: mockSingle });
  mockSingle.mockResolvedValue({ data: { id: "evidence-id-1" } });
});

// ---------------------------------------------------------------------------

describe("approveEntry", () => {
  it("未ログインのとき、エラーを返す", async () => {
    mockGetCurrentModerator.mockResolvedValueOnce(null);
    const result = await approveEntry("entry-1");
    expect(result).toEqual({ ok: false, error: "ログインが必要です" });
  });

  it("正常なとき、entries を published に更新して activity を記録する", async () => {
    const result = await approveEntry("entry-1");
    expect(result).toEqual({ ok: true });
    expect(mockFrom).toHaveBeenCalledWith("entries");
    expect(mockFrom).toHaveBeenCalledWith("activities");
  });

  it("DB 操作が失敗したとき、エラーを返す", async () => {
    mockUpdate.mockImplementationOnce(() => { throw new Error("DB error"); });
    const result = await approveEntry("entry-1");
    expect(result).toEqual({ ok: false, error: "承認に失敗しました" });
  });
});

// ---------------------------------------------------------------------------

describe("rejectEntry", () => {
  it("未ログインのとき、エラーを返す", async () => {
    mockGetCurrentModerator.mockResolvedValueOnce(null);
    const result = await rejectEntry("entry-1", "理由");
    expect(result).toEqual({ ok: false, error: "ログインが必要です" });
  });

  it("正常なとき、entries を rejected に更新して activity を記録する", async () => {
    const result = await rejectEntry("entry-1", "");
    expect(result).toEqual({ ok: true });
    expect(mockFrom).toHaveBeenCalledWith("entries");
    expect(mockFrom).toHaveBeenCalledWith("activities");
  });

  it("却下理由があるとき、evidences にも記録する", async () => {
    const result = await rejectEntry("entry-1", "根拠不十分");
    expect(result).toEqual({ ok: true });
    expect(mockFrom).toHaveBeenCalledWith("evidences");
  });

  it("却下理由が空白のみのとき、evidences に記録しない", async () => {
    await rejectEntry("entry-1", "   ");
    const calls = (mockFrom.mock.calls as unknown as string[][]).map((args) => args[0]);
    expect(calls).not.toContain("evidences");
  });

  it("DB 操作が失敗したとき、エラーを返す", async () => {
    mockUpdate.mockImplementationOnce(() => { throw new Error("DB error"); });
    const result = await rejectEntry("entry-1", "理由");
    expect(result).toEqual({ ok: false, error: "却下に失敗しました" });
  });
});

// ---------------------------------------------------------------------------

describe("updateEntryName", () => {
  it("未ログインのとき、エラーを返す", async () => {
    mockGetCurrentModerator.mockResolvedValueOnce(null);
    const result = await updateEntryName("entry-1", "新しい名前");
    expect(result).toEqual({ ok: false, error: "ログインが必要です" });
  });

  it("正常なとき、display_name を更新する", async () => {
    const result = await updateEntryName("entry-1", "新しい名前");
    expect(result).toEqual({ ok: true });
  });

  it("アカウント名が空のとき、エラーを返す", async () => {
    const result = await updateEntryName("entry-1", "");
    expect(result).toEqual({ ok: false, error: "アカウント名を入力してください" });
  });

  it("アカウント名が空白のみのとき、エラーを返す", async () => {
    const result = await updateEntryName("entry-1", "   ");
    expect(result).toEqual({ ok: false, error: "アカウント名を入力してください" });
  });
});

// ---------------------------------------------------------------------------

describe("updateEntryTwitterHandle", () => {
  it("未ログインのとき、エラーを返す", async () => {
    mockGetCurrentModerator.mockResolvedValueOnce(null);
    const result = await updateEntryTwitterHandle("entry-1", "newhandle");
    expect(result).toEqual({ ok: false, error: "ログインが必要です" });
  });

  it("正常なとき、twitter_handle を更新する", async () => {
    const result = await updateEntryTwitterHandle("entry-1", "newhandle");
    expect(result).toEqual({ ok: true });
  });

  it("ハンドルの前後の空白をトリムして保存する", async () => {
    await updateEntryTwitterHandle("entry-1", "  newhandle  ");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ twitter_handle: "newhandle" })
    );
  });
});

// ---------------------------------------------------------------------------

describe("updateEntryBlueskyHandle", () => {
  it("未ログインのとき、エラーを返す", async () => {
    mockGetCurrentModerator.mockResolvedValueOnce(null);
    const result = await updateEntryBlueskyHandle("entry-1", "new.bsky.social");
    expect(result).toEqual({ ok: false, error: "ログインが必要です" });
  });

  it("正常なとき、bluesky_handle を更新する", async () => {
    const result = await updateEntryBlueskyHandle("entry-1", "new.bsky.social");
    expect(result).toEqual({ ok: true });
  });

  it("ハンドルが空のとき、エラーを返す", async () => {
    const result = await updateEntryBlueskyHandle("entry-1", "");
    expect(result).toEqual({ ok: false, error: "Bluesky ハンドルを入力してください" });
  });

  it("ハンドルが空白のみのとき、エラーを返す", async () => {
    const result = await updateEntryBlueskyHandle("entry-1", "   ");
    expect(result).toEqual({ ok: false, error: "Bluesky ハンドルを入力してください" });
  });
});

// ---------------------------------------------------------------------------

describe("updateEntryStatus", () => {
  it("未ログインのとき、エラーを返す", async () => {
    mockGetCurrentModerator.mockResolvedValueOnce(null);
    const result = await updateEntryStatus("entry-1", "migrated");
    expect(result).toEqual({ ok: false, error: "ログインが必要です" });
  });

  it("正常なとき、transition_status を更新する", async () => {
    const result = await updateEntryStatus("entry-1", "migrated");
    expect(result).toEqual({ ok: true });
  });

  it("ステータスが空のとき、エラーを返す", async () => {
    const result = await updateEntryStatus("entry-1", "");
    expect(result).toEqual({ ok: false, error: "ステータスを選択してください" });
  });
});

// ---------------------------------------------------------------------------

describe("setEntryClassification", () => {
  it("未ログインのとき、エラーを返す", async () => {
    mockGetCurrentModerator.mockResolvedValueOnce(null);
    const result = await setEntryClassification("entry-1", "a1b2c3d4-e5f6-4a7b-8c9d-000000000001");
    expect(result).toEqual({ ok: false, error: "ログインが必要です" });
  });

  it("正常なとき、entry_fields の classification_id を更新する", async () => {
    const result = await setEntryClassification("entry-1", "a1b2c3d4-e5f6-4a7b-8c9d-000000000001");
    expect(result).toEqual({ ok: true });
    expect(mockFrom).toHaveBeenCalledWith("entry_fields");
  });

  it("classification_id が空のとき、null として保存する", async () => {
    await setEntryClassification("entry-1", "");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ classification_id: null })
    );
  });

  it("DB 操作が失敗したとき、エラーを返す", async () => {
    mockUpdate.mockImplementationOnce(() => { throw new Error("DB error"); });
    const result = await setEntryClassification("entry-1", "a1b2c3d4-e5f6-4a7b-8c9d-000000000001");
    expect(result).toEqual({ ok: false, error: "分類の更新に失敗しました" });
  });
});

// ---------------------------------------------------------------------------

describe("addEvidence", () => {
  it("未ログインのとき、エラーを返す", async () => {
    mockGetCurrentModerator.mockResolvedValueOnce(null);
    const result = await addEvidence("entry-1", "根拠テキスト");
    expect(result).toEqual({ ok: false, error: "ログインが必要です" });
  });

  it("正常なとき、evidences に追加して id を返す", async () => {
    const result = await addEvidence("entry-1", "根拠テキスト");
    expect(result).toEqual({ ok: true, id: "evidence-id-1" });
    expect(mockFrom).toHaveBeenCalledWith("evidences");
    expect(mockFrom).toHaveBeenCalledWith("activities");
  });

  it("内容が空のとき、エラーを返す", async () => {
    const result = await addEvidence("entry-1", "");
    expect(result).toEqual({ ok: false, error: "根拠を入力してください" });
  });

  it("内容が空白のみのとき、エラーを返す", async () => {
    const result = await addEvidence("entry-1", "   ");
    expect(result).toEqual({ ok: false, error: "根拠を入力してください" });
  });

  it("内容の前後の空白をトリムして保存する", async () => {
    await addEvidence("entry-1", "  根拠テキスト  ");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ content: "根拠テキスト" })
    );
  });

  it("DB 操作が失敗したとき、エラーを返す", async () => {
    mockInsert.mockImplementationOnce(() => { throw new Error("DB error"); });
    const result = await addEvidence("entry-1", "根拠テキスト");
    expect(result).toEqual({ ok: false, error: "根拠の追加に失敗しました" });
  });
});
