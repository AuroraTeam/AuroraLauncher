require("source-map-support").install()

import * as colors from "colors/safe"

import { AuthManager } from "./auth/AuthManager"
import { CommandsManager } from "./commands/CommandsManager"
import { ConfigManager } from "./config/ConfigManager"
import { LogHelper } from "./helpers/LogHelper"
import { StorageHelper } from "./helpers/StorageHelper"
import { MirrorManager } from "./mirror/MirrorManager"
import { ModulesManager } from "./modules/ModulesManager"
import { SocketManager } from "./requests/SocketManager"
import { UpdatesManager } from "./updates/UpdatesManager"
import { VersionHelper } from "./helpers/VersionHelper"

export class LauncherServer {
    readonly ConfigManager: ConfigManager
    readonly AuthManager: AuthManager
    readonly CommandsManager: CommandsManager
    readonly MirrorManager: MirrorManager
    readonly ModulesManager: ModulesManager
    readonly SocketManager: SocketManager
    readonly UpdatesManager: UpdatesManager

    constructor() {
        LogHelper.raw(
            colors.bold(
                colors.cyan("AuroraLauncher ") +
                    colors.green("LauncherServer ") +
                    "v" +
                    colors.yellow(`${VersionHelper.getVersion()} `) +
                    colors.blue("https://gitlab.com/aurorateam")
            )
        )
        LogHelper.raw(colors.bold(colors.green("Documentation page ") + colors.blue("https://aurora-launcher.ru/wiki")))
        StorageHelper.createMissing()
        LogHelper.info("Initialization start")
        this.ConfigManager = new ConfigManager()
        this.AuthManager = new AuthManager()
        this.CommandsManager = new CommandsManager()
        this.MirrorManager = new MirrorManager()
        this.ModulesManager = new ModulesManager()
        this.SocketManager = new SocketManager()
        this.UpdatesManager = new UpdatesManager()
        LogHelper.info("Initialization end")
        this.ModulesManager.emit("postInit")
    }
}

export const App = new LauncherServer()
