const { build } = require("esbuild")

;(async () => {
    console.log("Build...")
    console.time("Build successfully")

    await Promise.all(
        [
            // Web
            {
                platform: "browser",
                outfile: "dist/aurora-api-web.js",
            },
            // Node
            {
                format: "cjs",
                outfile: "dist/aurora-api-node.cjs",
            },
            {
                outfile: "dist/aurora-api-node.mjs",
            },
        ].map(async (config) => {
            await build({
                entryPoints: ["src/index.ts"],
                bundle: true,
                minify: true,
                sourcemap: true,
                format: "esm",
                platform: "node",
                ...config,
            }).catch(() => process.exit(1))
        })
    )

    console.timeEnd("Build successfully")
})()
