import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      "no-console": ["warn", { allow: ["error", "warn"] }],
      "react-hooks/exhaustive-deps": "warn",
      "react/no-array-index-key": "warn",
    },
  },
]);

export default eslintConfig;
