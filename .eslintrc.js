module.exports = {
    env: {
        es2021: true,
        node: true,
    },
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    overrides: [],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
    },
    plugins: ["@typescript-eslint", "node"],
    rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "node/no-sync": "warn", // TODO Set to error
        "node/prefer-promises/fs": "warn", // TODO Set to error
    },
}
