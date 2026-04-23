import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
  ...nextVitals,
  { rules: jsxA11y.flatConfigs.recommended.rules },
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
      // Safari + VoiceOver drops list semantics on ul when list-style:none is applied; allow explicit role="list"
      "jsx-a11y/no-redundant-roles": ["error", { ul: ["list"] }],
    },
  },
]);

export default eslintConfig;
