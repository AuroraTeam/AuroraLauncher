import { spawn } from "child_process";
import { dirname } from "path";
import { fileURLToPath } from "url";

function write(inp, out, prefix) {
    inp.on("data", (data) => out.write(`${prefix} ${data.toString()}`));
}

const cwd = fileURLToPath(dirname(dirname(import.meta.url)));

const build = spawn("npm", "run build:dev -- --watch --logLevel info".split(" "), {
    shell: true,
    cwd,
});

write(build.stdout, process.stdout, "[build stdout]");
write(build.stderr, process.stderr, "[build error]");

const node = spawn("node", "--watch dist/LauncherServer.js".split(" "), {
    shell: true,
    cwd,
});

write(node.stdout, process.stdout, "[node stdout]");
write(node.stderr, process.stderr, "[node error]");
