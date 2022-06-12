import { LogHelper } from "@root/helpers/LogHelper"

import { App } from "../../LauncherServer"
import { AbstractCommand, Category } from "../AbstractCommand"

export class UpdateCommand extends AbstractCommand {
    constructor() {
        super("update", "Update LauncherServer", Category.BASIC)
    }

    invoke(): void {
        if (App.UpdateManager.needUpdate() === true)
            return LogHelper.info("You already have the latest version of LauncherServer installed")

        App.UpdateManager.installUpdate()
    }
}
