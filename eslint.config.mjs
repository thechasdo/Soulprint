import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "supabase/**",
      "next-env.d.ts",
      "tsconfig.tsbuildinfo"
    ]
  },
  ...nextVitals,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/exhaustive-deps": "off"
    }
  }
];

export default eslintConfig;
