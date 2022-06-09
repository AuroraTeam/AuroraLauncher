import { App } from "@root/LauncherServer"

import { LogHelper } from "../../helpers/LogHelper"
import { AbstractCommand, Category } from "../AbstractCommand"

export class AboutCommand extends AbstractCommand {
    constructor() {
        super("status", App.LangManager.getTranslate().CommandsManager.commands.basic.StatusCommand, Category.BASIC)
    }

    invoke(): void {
        LogHelper.info("Method not implemented")
    }
}
