import { App } from "@root/LauncherServer"

import { AbstractCommand, Category } from "../AbstractCommand"

export class SyncAllCommand extends AbstractCommand {
    constructor() {
        super(
            "syncall",
            App.LangManager.getTranslate().CommandsManager.commands.updates.SyncAllCommand,
            Category.UPDATES
        )
    }

    invoke(): void {
        App.ProfilesManager.reloadProfiles()
        App.UpdatesManager.hashUpdatesDir()
    }
}
