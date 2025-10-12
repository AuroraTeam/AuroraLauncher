import pluginJs from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
    { ignores: ["dist"] },
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
    { languageOptions: { globals: globals.node } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
        },
    },
];
