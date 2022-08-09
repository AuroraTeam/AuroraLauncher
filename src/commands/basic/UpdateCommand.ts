import { App } from "@root/LauncherServer"

import { AbstractCommand, Category } from "../AbstractCommand"

export class UpdateCommand extends AbstractCommand {
    constructor() {
        super("update", "Update LauncherServer", Category.BASIC)
    }

    invoke(): void {
        App.UpdateManager.checkAndInstallUpdate()
    }
}
