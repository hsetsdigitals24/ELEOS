import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // The in-memory MongoDB binary downloads on the very first run.
    hookTimeout: 120_000,
    testTimeout: 30_000,
  },
});
