import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  { files: ["**/*.js"], env:{"jest":true}, languageOptions: { sourceType: "commonjs" } },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
];
