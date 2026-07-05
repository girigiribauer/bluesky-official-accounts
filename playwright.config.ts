import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  // ローカル DB を共有するため直列実行
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:15010",
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:15010",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
