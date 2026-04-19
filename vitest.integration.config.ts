import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      // Next.js の server-only パッケージはテスト環境では不要
      "server-only": new URL("./tests/mocks/server-only.ts", import.meta.url).pathname,
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.integration.test.ts"],
  },
});