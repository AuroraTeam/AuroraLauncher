import { defineConfig } from "tsup"

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    target: "node18",
    sourcemap: true,
    minify: true,
    clean: true,
    dts: true,
})
