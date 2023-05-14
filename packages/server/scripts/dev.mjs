import { spawn } from "child_process";

import nodemon from "nodemon";

nodemon({
    watch: ["/dist/app.js"],
});

spawn("npm", "run build:dev -- --watch --logLevel info".split(" "), {
    shell: true,
    stdio: "inherit",
});
