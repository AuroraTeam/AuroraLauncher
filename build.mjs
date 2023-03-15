import { esbuildDecorators } from "@anatine/esbuild-decorators"
import esbuild from "esbuild"

// eslint-disable-next-line @typescript-eslint/no-unused-vars

const context = await esbuild.context({
    platform: "node",
    target: "node18",
    bundle: true,
    sourcemap: true,
    plugins: [esbuildDecorators()],
    entryPoints: ["src/app.ts"],
    outdir: "dist",
})

await context.watch()
