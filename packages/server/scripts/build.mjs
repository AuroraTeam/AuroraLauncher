import { esbuildDecorators } from "@aurora-launcher/esbuild-decorators";
import { build } from "esbuild";
import minimist from "minimist";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { _, ...buildArgs } = minimist(process.argv.slice(2));

console.log("Build...");
console.time("Build successfully");

await build({
    platform: "node",
    target: "node18",
    bundle: true,
    sourcemap: true,
    plugins: [esbuildDecorators()],
    entryPoints: ["src/app.ts"],
    outdir: "dist",
    ...buildArgs,
});

console.timeEnd("Build successfully");
