import { App } from "@root/LauncherServer"

import { AbstractCommand, Category } from "../AbstractCommand"

export class SyncUpdatesCommand extends AbstractCommand {
    constructor() {
        super(
            "syncupdates",
            App.LangManager.getTranslate().CommandsManager.commands.updates.SyncUpdatesCommand,
            Category.UPDATES
        )
    }

    invoke(): void {
        App.UpdatesManager.hashUpdatesDir()
    }
}
