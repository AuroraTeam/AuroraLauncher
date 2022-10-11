import { AbstractCommand, Category, LogHelper } from "@root/utils"
import { App } from "@root/app"

export class ReloadCommand extends AbstractCommand {
    constructor() {
        super({
            name: "reload",
            description: "Restarts LauncherServer",
            category: Category.BASIC,
        })
    }

    invoke(): void {
        LogHelper.info("LauncherServer restarts...")
        App.reload()
    }
}
