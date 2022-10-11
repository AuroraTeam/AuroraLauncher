import { AbstractCommand, Category, LogHelper } from "@root/utils"
import { App } from "@root/app"

export class StatusCommand extends AbstractCommand {
    constructor() {
        super({
            name: "status",
            description: App.LangManager.getTranslate.CommandsManager.commands.basic.StatusCommand,
            category: Category.BASIC,
        })
    }

    invoke(): void {
        LogHelper.info("Method not implemented")
    }
}
