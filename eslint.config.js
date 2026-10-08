import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "coverage", "node_modules", "node_modules/.tmp"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      /*
       * Correctness only. No stylistic or formatting rules are enabled on purpose:
       * the existing codebase has never been linted, and turning on formatting
       * rules would turn this ticket into a whole-repo reformat. Formatting is
       * Prettier's job, and Prettier is deliberately not introduced here.
       */
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          /*
           * An unused `catch (error)` is not a defect. `api/contact.ts` and
           * `pages/Contact.tsx` both write `catch (error) { respond("...") }` on
           * purpose - the message is deliberately generic, so the error object is
           * not surfaced. This is the common shape for a handler that must not
           * leak internals, and the Sawa safety handlers (tickets 16-18) will want
           * it too. Flagging it would push the codebase toward logging raw errors
           * into responses, which is the opposite of what we want here.
           */
          caughtErrors: "none",
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    // Server-side: node globals, and the loose handler signatures the api uses.
    files: ["api/**/*.ts"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    files: ["vite.config.ts", "vitest.config.ts", "tests/**/*.ts"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
);