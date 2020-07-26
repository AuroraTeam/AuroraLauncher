require("source-map-support").install()
import { ConfigManager } from "./LauncherServerConfig"
import { StorageHelper } from "./helpers/StorageHelper"
import { AuthManager } from "./auth/AuthManager"
import { CommandsManager } from "./commands/CommandsManager"
import { MirrorManager } from "./mirror/MirrorManager"
import { EventEmitter } from "events"
import { LauncherServerInterface } from "./LauncherServerInterface"
import { LogHelper } from "./helpers/LogHelper"
import * as colors from "colors/safe"

export class LauncherServer extends EventEmitter implements LauncherServerInterface {
    config: ConfigManager
    AuthManager: AuthManager
    CommandsManager: CommandsManager
    MirrorManager: MirrorManager

    constructor() {
        super();
        StorageHelper.createMissing()
        this.config = new ConfigManager()
        this.AuthManager = new AuthManager(this)
        this.CommandsManager = new CommandsManager(this)
        this.MirrorManager = new MirrorManager(this)
        this.emit('postInit')

        LogHelper.raw(
            colors.bold(
                colors.cyan("AuroraLauncher ") +
                colors.green("LauncherServer ") +
                "v" +
                colors.yellow(process.env.npm_package_version)
            )
        )
        LogHelper.info("LauncherServer Started")
    }
}

new LauncherServer()
