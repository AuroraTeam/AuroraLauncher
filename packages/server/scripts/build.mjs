import { esbuildDecorators } from "@aurora-launcher/esbuild-decorators";
import { context } from "esbuild";
import minimist from "minimist";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { _, watch, prod, ...args } = minimist(process.argv.slice(2));

if (prod) {
    args.minify = true;
    args.sourcesContent = false;
}

if (!watch) {
    console.log("Build...");
    console.time("Build successfully");
}

const ctx = await context({
    platform: "node",
    target: "node20",
    bundle: true,
    sourcemap: true,
    plugins: [esbuildDecorators()],
    entryPoints: ["src/app.ts"],
    outdir: "dist",
    ...args,
}).catch(() => process.exit(1));

if (watch) {
    console.log("Watching...");
    await ctx.watch();
} else {
    await ctx.rebuild();
    await ctx.dispose();
    console.timeEnd("Build successfully");
}
