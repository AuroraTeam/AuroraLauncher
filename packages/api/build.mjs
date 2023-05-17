import { context } from "esbuild"

const watchFlag = process.argv[2] === "--watch"

;(async () => {
    console.log("Build...")
    console.time("Build successfully")

    await Promise.all(
        [
            // Web
            {
                id: "browser",
                platform: "browser",
                outfile: "dist/aurora-api-web.js",
            },
            // Node
            {
                id: "node-cjs",
                format: "cjs",
                outfile: "dist/aurora-api-node.cjs",
            },
            {
                id: "node-mjs",
                outfile: "dist/aurora-api-node.mjs",
            },
        ].map(async ({ id, ...config }) => {
            const ctx = await context({
                entryPoints: ["src/index.ts"],
                bundle: true,
                minify: true,
                sourcemap: true,
                format: "esm",
                platform: "node",
                keepNames: true,
                ...config,
            }).catch(() => process.exit(1))

            if (watchFlag) {
                console.log(`Watching "${id}" ...`)
                await ctx.watch()
            } else {
                ctx.dispose()
            }
        })
    )

    console.timeEnd("Build successfully")
})()
