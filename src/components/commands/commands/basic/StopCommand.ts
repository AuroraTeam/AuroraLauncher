import { App } from "@root/app"
import { AbstractCommand, Category } from "@root/utils"

export class StopCommand extends AbstractCommand {
    constructor() {
        super({
            name: "stop",
            description:
                App.LangManager.getTranslate.CommandsManager.commands.basic
                    .StopCommand,
            category: Category.BASIC,
        })
    }

    invoke(): void {
        process.exit(0)
    }
}
