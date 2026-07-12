import { test, expect } from "@playwright/test";
import { adminDb } from "./helpers";

// 公開フォーム2種の投稿フロー。
// 登録フォームの Bluesky アカウント解決（外部 API 依存）は
// 内部 API /api/contribution/register/check をブラウザ側でスタブして回避する。

test.describe("来て欲しいフォーム", () => {
  // Twitter ハンドルは15文字以内の制約があるため base36 で短くする
  const twitterHandle = `e2e_${Date.now().toString(36)}`;

  test.afterAll(async () => {
    await adminDb().from("request_submissions").delete().eq("twitter_handle", twitterHandle);
  });

  test("入力して送信すると完了ページが表示され、申請が保存される", async ({ page }) => {
    // dev サーバーの初回コンパイルを済ませておく（フォーム内 fetch のタイムアウト対策）
    await page.request.get("/api/contribution/request/check?url=https://x.com/e2e_warmup");

    await page.goto("/contribution/request");

    await page.locator("#twitter-url").fill(`https://x.com/${twitterHandle}`);
    await page.locator("#twitter-url").blur();
    await expect(page.getByText("登録可能です")).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: "IT・テック・Web" }).click();
    await page.locator("#twitter-name").fill("[テスト] E2E来て欲しい");

    const submit = page.getByRole("button", { name: "投稿する" });
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(page).toHaveURL(/\/contribution\/request\/complete/);

    const { data } = await adminDb()
      .from("request_submissions")
      .select("display_name, field_id")
      .eq("twitter_handle", twitterHandle)
      .single();
    expect(data?.display_name).toBe("[テスト] E2E来て欲しい");
    expect(data?.field_id).toBe("tech");
  });
});

test.describe("来て欲しいフォーム（重複投稿）", () => {
  // 既に来て欲しいリストに載っているアカウントを投稿しようとするケース。
  // エラーというより日常的に起きる操作なので、表示の配線を E2E で守る。
  // ハンドルは15文字以内（e2edup_ 7文字 + base36 8文字）
  const twitterHandle = `e2edup_${Date.now().toString(36).slice(-8)}`;
  let accountId: string;

  test.beforeAll(async () => {
    const db = adminDb();
    const { data: account, error: accountError } = await db
      .from("accounts")
      .insert({ display_name: "[テスト] E2E重複元" })
      .select("id")
      .single();
    if (accountError) throw accountError;
    accountId = account.id;

    const { error: requestError } = await db
      .from("requests")
      .insert({ account_id: accountId, twitter_handle: twitterHandle });
    if (requestError) throw requestError;
  });

  test.afterAll(async () => {
    const db = adminDb();
    await db.from("requests").delete().eq("twitter_handle", twitterHandle);
    await db.from("accounts").delete().eq("id", accountId);
  });

  test("登録済みの URL を入力すると重複メッセージが表示され、送信できない", async ({ page }) => {
    await page.goto("/contribution/request");

    await page.locator("#twitter-url").fill(`https://x.com/${twitterHandle}`);
    await page.locator("#twitter-url").blur();
    await expect(page.getByText("このアカウントはすでに登録されています")).toBeVisible({ timeout: 15_000 });

    // 他の項目をすべて埋めても送信ボタンは押せないまま
    await page.getByRole("button", { name: "IT・テック・Web" }).click();
    await page.locator("#twitter-name").fill("[テスト] E2E重複投稿");
    await expect(page.getByRole("button", { name: "投稿する" })).toBeDisabled();
  });
});

test.describe("登録フォーム", () => {
  const did = `did:plc:e2ereg${Date.now()}`;

  test.afterAll(async () => {
    await adminDb().from("entry_submissions").delete().eq("bluesky_did", did);
  });

  test("アカウント確認後に入力して送信すると完了ページが表示され、申請が保存される", async ({ page }) => {
    // Bluesky アカウント解決をスタブ（外部 API を引いたことにする）
    await page.route("**/api/contribution/register/check*", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          status: "new",
          did,
          handle: "e2e-test.bsky.social",
          displayName: "[テスト] E2E登録",
        }),
      })
    );

    await page.goto("/contribution/register");

    await page.locator("#bluesky-account").fill("e2e-test.bsky.social");
    await expect(page.getByText("@e2e-test.bsky.social（新規登録）")).toBeVisible();

    // アカウント名称は displayName から自動入力される
    await expect(page.locator("#account-name")).toHaveValue("[テスト] E2E登録");

    await page.getByRole("button", { name: "IT・テック・Web" }).click();
    await page.locator("#migration-status").selectOption("dual_active");
    await page.locator("#twitter-url").fill("https://x.com/e2e_reg_test");
    await page.locator("#evidence-text").fill("E2E テスト用の根拠");

    const submit = page.getByRole("button", { name: "投稿する" });
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect(page).toHaveURL(/\/contribution\/register\/complete/);

    const { data } = await adminDb()
      .from("entry_submissions")
      .select("account_name, field_id, transition_status")
      .eq("bluesky_did", did)
      .single();
    expect(data?.account_name).toBe("[テスト] E2E登録");
    expect(data?.field_id).toBe("tech");
    expect(data?.transition_status).toBe("dual_active");
  });
});
