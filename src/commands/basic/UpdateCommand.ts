import { LogHelper } from "@root/helpers/LogHelper"

import { App } from "../../LauncherServer"
import { AbstractCommand, Category } from "../AbstractCommand"

export class UpdateCommand extends AbstractCommand {
    constructor() {
        super("update", "Update LauncherServer", Category.BASIC)
    }

    invoke(): void {
        if(!App.UpdateManager.checkUpdate()) return LogHelper.info("The latest version of LauncherServer is already installed on the server")

        App.UpdateManager.installUpdate()
    }
}
