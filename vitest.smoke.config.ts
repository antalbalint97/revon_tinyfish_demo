import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/smoke/**/*.smoke.test.ts"],
    environment: "node",
    globals: true,
    fileParallelism: false,
    clearMocks: true,
    restoreMocks: true,
  },
});
