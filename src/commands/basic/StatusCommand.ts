import { App } from "@root/LauncherServer"

import { LogHelper } from "../../helpers/LogHelper"
import { AbstractCommand, Category } from "../AbstractCommand"

export class AboutCommand extends AbstractCommand {
    constructor() {
        super({
            name: "status",
            description: App.LangManager.getTranslate().CommandsManager.commands.basic.StatusCommand,
            category: Category.BASIC,
        })
    }

    invoke(): void {
        LogHelper.info("Method not implemented")
    }
}
