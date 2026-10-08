import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    /*
     * Node environment: everything under test so far is server-side logic
     * (`api/` handlers and, later, the pure safety functions in
     * `src/lib/sawa/safety/`). There are no component tests yet, so this is not
     * jsdom - if one is ever added it should be opted into per-file with a
     * `@vitest-environment` docblock rather than globally.
     */
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["api/**/*.ts", "src/lib/**/*.ts"],
    },
  },
});