import { LogHelper } from "@root/helpers"
import { App } from "@root/LauncherServer"

import { AbstractCommand, Category } from "../AbstractCommand"

export class ReloadCommand extends AbstractCommand {
    constructor() {
        super("reload", "Restarts LauncherServer", Category.BASIC)
    }

    invoke(): void {
        LogHelper.info("LauncherServer restarts...")
        App.reload()
    }
}
