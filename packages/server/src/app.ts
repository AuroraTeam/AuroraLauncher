import "source-map-support/register";

import { LauncherServer } from "./LauncherServer";

new LauncherServer().start().catch((error: unknown) => {
    console.error("Failed to start LauncherServer:", error);
    process.exitCode = 1;
});
