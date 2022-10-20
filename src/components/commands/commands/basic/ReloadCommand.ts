import { LangManager } from "@root/components/langs"
import { LauncherServer } from "@root/LauncherServer"
import { AbstractCommand, Category, LogHelper } from "@root/utils"

export class ReloadCommand extends AbstractCommand {
    constructor(
        langManager: LangManager,
        private readonly launcherServer: LauncherServer
    ) {
        super({
            name: "reload",
            description: "Restarts LauncherServer",
            category: Category.BASIC,
        })
    }

    invoke(): void {
        LogHelper.info("LauncherServer restarts...")
        this.launcherServer.reload()
    }
}
