import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      "server-only": new URL("./tests/mocks/server-only.ts", import.meta.url).pathname,
    },
  },
  test: {
    environment: "node",
    exclude: ["**/*.integration.test.ts", "tests/e2e/**", "node_modules/**"],
  },
});
