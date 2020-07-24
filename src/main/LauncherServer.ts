require("source-map-support").install()
import { ConfigManager } from "./LauncherServerConfig"
import { StorageHelper } from "./helpers/StorageHelper"
import { AuthManager } from "./auth/AuthManager"
import { CommandsManager } from "./commands/CommandsManager"
import { MirrorManager } from "./mirror/MirrorManager"

export class LauncherServer {
    config: ConfigManager
    AuthManager: AuthManager
    CommandsManager: CommandsManager
    MirrorManager: MirrorManager

    constructor() {
        StorageHelper.createMissing()
        this.config = new ConfigManager()
        this.AuthManager = new AuthManager(this)
        this.CommandsManager = new CommandsManager(this)
        this.MirrorManager = new MirrorManager(this)
    }

    main(): void {}
}

const ls = new LauncherServer()
ls.main()
