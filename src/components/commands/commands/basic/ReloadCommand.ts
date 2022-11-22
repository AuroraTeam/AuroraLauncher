import { LauncherServer } from "@root/LauncherServer"
import { AbstractCommand, Category, LogHelper } from "@root/utils"
import { delay, inject, injectable } from "tsyringe"

@injectable()
export class ReloadCommand extends AbstractCommand {
    constructor(
        @inject(delay(() => LauncherServer))
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
