require("source-map-support").install()
import { ConfigManager } from "./LauncherServerConfig"
import { StorageHelper } from "./helpers/StorageHelper"
import { AuthManager } from "./auth/AuthManager"
import { CommandsManager } from "./commands/CommandsManager"
import { MirrorManager } from "./mirror/MirrorManager"
import { EventEmitter } from "events"
import { LauncherServerInterface } from "./LauncherServerInterface"

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
    }
}

new LauncherServer()
