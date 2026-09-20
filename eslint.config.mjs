import next from "eslint-config-next";

const eslintConfig = [
  ...next,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "no-undef": "off",
      // The original codebase uses the fetch-in-effect pattern throughout
      // (pre-React-19 style); keep lint usable without rewriting every page.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    ignores: ["node_modules/**", ".next/**", "next-env.d.ts", "dev.log", "db/**"],
  },
];

export default eslintConfig;

