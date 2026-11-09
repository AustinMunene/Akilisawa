import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

/*
 * The replay suite (tests/replay): real conversations against the live model.
 * `npm run replay`. Separate from vitest.config.ts so `npm run verify` never
 * spends model calls. Provider keys come from .env.local; escalation is forced
 * off so crisis scenarios never email the support inbox.
 */
export default defineConfig(({ mode }) => ({
  test: {
    environment: "node",
    include: ["tests/replay/**/*.replay.ts"],
    testTimeout: 5 * 60_000,
    fileParallelism: false,
    sequence: { concurrent: false },
    env: {
      ...loadEnv(mode, process.cwd(), ""),
      SAWA_ESCALATION_ENABLED: "false",
    },
  },
}));
