import { exec } from "child_process";
import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["esm"],
    target: "node22",
    sourcemap: true,
    minify: true,
    clean: true,
    onSuccess: async () => {
        exec("tsc");
    },
});
