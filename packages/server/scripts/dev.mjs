import { spawn } from "child_process";
import { dirname } from "path";
import { fileURLToPath } from "url";

import nodemon from "nodemon";

const cwd = fileURLToPath(dirname(dirname(import.meta.url)));

nodemon({
    script: "dist/app.js",
    watch: ["dist/app.js"],
    args: ["--dev"],
    cwd,
});

spawn("npm", "run build:dev -- --watch --logLevel info".split(" "), {
    shell: true,
    cwd,
}).stderr.on("data", (data) => console.log(data.toString()));
