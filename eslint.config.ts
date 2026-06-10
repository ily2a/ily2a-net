import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
// eslint-plugin-jsx-a11y ships no type declarations; only its recommended
// flat-config rules object is used below.
// @ts-expect-error - no bundled types
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
