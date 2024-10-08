import { context } from "esbuild"

const watchFlag = process.argv[2] === "--watch"

;(async () => {
    if (!watchFlag) {
        console.log("Build...")
        console.time("Build successfully")
    }

    await Promise.all(
        [
            // Web
            {
                id: "browser",
                platform: "browser",
                outfile: "dist/index-web.js",
            },
            // Node
            {
                id: "node-cjs",
                format: "cjs",
                outfile: "dist/index-node.cjs",
            },
            {
                id: "node-mjs",
                outfile: "dist/index-node.mjs",
            },
        ].map(async ({ id, ...config }) => {
            const ctx = await context({
                entryPoints: ["src/index.ts"],
                bundle: true,
                minify: true,
                sourcemap: true,
                format: "esm",
                platform: "node",
                ...config,
            }).catch(() => process.exit(1))

            if (watchFlag) {
                console.log(`Watching "${id}" ...`)
                await ctx.watch()
            } else {
                await ctx.rebuild()
                await ctx.dispose()
            }
        }),
    )

    !watchFlag && console.timeEnd("Build successfully")
})()
