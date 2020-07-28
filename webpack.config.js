var path = require("path")

module.exports = {
    entry: "./src/main/LauncherServer.ts",
    node: {
        global: true,
        __filename: true,
        __dirname: false,
    },
    target: "node",
    mode: process.env.NODE_ENV,
    devtool: process.env.NODE_ENV == "production" ? "inline-source-map" : "source-map",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "LauncherServer.js",
    },
    resolve: {
        extensions: [".ts", ".js"], //resolve all the modules other than index.ts
    },
    module: {
        rules: [
            {
                use: "ts-loader",
                test: /\.ts?$/,
            },
        ],
    },
}