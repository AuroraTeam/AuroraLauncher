require("source-map-support").install()
import { ConfigManager } from "./config/ConfigManager"
import { StorageHelper } from "./helpers/StorageHelper"
import { AuthManager } from "./auth/AuthManager"
import { CommandsManager } from "./commands/CommandsManager"
import { MirrorManager } from "./mirror/MirrorManager"
import { LogHelper } from "./helpers/LogHelper"
import * as colors from "colors/safe"
import { ModulesManager } from "./modules/ModulesManager"
import { SocketManager } from "./requests/SocketManager"
import { UpdatesManager } from "./updates/UpdatesManager"

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
                colors.yellow(`${process.env.npm_package_version} `) +
                colors.blue("https://gitlab.com/aurorateam")
            )
        )
        LogHelper.raw(colors.bold(colors.green("Documentation page ") + colors.blue("https://aurora-launcher.ru/wiki")))
        StorageHelper.createMissing()
        LogHelper.info("Initialization start")
        this.ConfigManager = new ConfigManager(this)
        this.AuthManager = new AuthManager(this)
        this.CommandsManager = new CommandsManager(this)
        this.MirrorManager = new MirrorManager(this)
        this.ModulesManager = new ModulesManager(this)
        this.SocketManager = new SocketManager(this)
        this.UpdatesManager = new UpdatesManager(this)
        LogHelper.info("Initialization end")
        this.ModulesManager.emit("postInit")
    }
}

new LauncherServer()
