import { App } from "@root/LauncherServer"

import { AbstractCommand, Category } from "../AbstractCommand"

export class StopCommand extends AbstractCommand {
    constructor() {
        super({
            name: "stop",
            description: App.LangManager.getTranslate().CommandsManager.commands.basic.StopCommand,
            category: Category.BASIC,
        })
    }

    invoke(): void {
        process.exit(0)
    }
}
