import { esbuildDecorators } from "@aurora-launcher/esbuild-decorators";
import { build, context } from "esbuild";
import minimist from "minimist";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { _, watch, ...args } = minimist(process.argv.slice(2));

const options = {
    platform: "node",
    target: "node18",
    bundle: true,
    sourcemap: true,
    plugins: [esbuildDecorators()],
    entryPoints: ["src/app.ts"],
    outdir: "dist",
    ...args,
};

if (watch) {
    const ctx = await context(options).catch(() => process.exit(1));
    await ctx.watch();
} else {
    console.log("Build...");
    console.time("Build successfully");
    await build(options).catch(() => process.exit(1));
    console.timeEnd("Build successfully");
}
