import { AbstractCommand, Category } from "../AbstractCommand"
import { App } from "@root/LauncherServer";

export class StopCommand extends AbstractCommand {
    constructor() {
        super("stop", App.LangManager.getTranslate().CommandsManager.commands.basic.StopCommand, Category.BASIC)
    }

    invoke(): void {
        process.exit(0)
    }
}
