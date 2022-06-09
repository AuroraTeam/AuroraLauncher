import { App } from "@root/LauncherServer"

import { AbstractCommand, Category } from "../AbstractCommand"

export class StopCommand extends AbstractCommand {
    constructor() {
        super("stop", App.LangManager.getTranslate().CommandsManager.commands.basic.StopCommand, Category.BASIC)
    }

    invoke(): void {
        process.exit(0)
    }
}
