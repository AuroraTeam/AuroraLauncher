import { defineConfig } from "tsup";

export default defineConfig((options) => ({
    entry: { LauncherServer: "src/app.ts" },
    platform: "node",
    target: "node22",
    sourcemap: options.watch ? true : "inline",
    minify: !options.watch,
    bundle: true,
    clean: !options.watch,
    esbuildOptions: () => ({
        sourcesContent: !options.watch,
    }),
}));
