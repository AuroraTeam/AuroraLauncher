import "source-map-support/register";

import { LauncherServer } from "./LauncherServer";

const server = new LauncherServer();

const shutdown = () => {
    void server.stop().catch((error: unknown) => {
        console.error("Failed to stop LauncherServer:", error);
        process.exitCode = 1;
    });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

server.start().catch((error: unknown) => {
    console.error("Failed to start LauncherServer:", error);
    process.exitCode = 1;
});
