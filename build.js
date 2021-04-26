const { compile } = require("nexe")

const buildsList = [
    {
        // mac
        output: "LauncherServer_mac64",
        targets: ["mac-x64-12.18.2"],
    },
    {
        // linux
        output: "LauncherServer_linux64",
        targets: ["linux-x64-12.16.2"],
    },
    {
        // windows
        output: "LauncherServer_win64.exe",
        targets: ["windows-x64-12.18.2"],
    },
]

const builds = buildsList.map((build) =>
    Object.assign(build, {
        // Общие параметры
        input: "./LauncherServer.js",
        cwd: "./dist",
    })
)

builds.forEach(async (config) => {
    await compile(config)
    console.log(`Build for ${config.targets[0]} was successful`)
})
