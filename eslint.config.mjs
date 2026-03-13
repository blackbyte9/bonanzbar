import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
    {
    rules: {
      semi: "error",
      "no-trailing-spaces": "error",
      "no-duplicate-imports": "error",
      "eol-last": ["error", "always"],
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
      "no-trailing-spaces": "error",
      "no-console": "warn", // Allow console statements, but warn about them
      "no-debugger": "warn", // Allow debugger statements, but warn about them
    },
  },
]);

export default eslintConfig;
