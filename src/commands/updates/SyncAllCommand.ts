import { App } from "../../LauncherServer"
import { AbstractCommand, Category } from "../AbstractCommand"

export class SyncAllCommand extends AbstractCommand {
    constructor() {
        super({
            name: "syncall",
            description: App.LangManager.getTranslate().CommandsManager.commands.updates.SyncAllCommand,
            category: Category.UPDATES,
        })
    }

    invoke(): void {
        App.ProfilesManager.reloadProfiles()
        App.UpdatesManager.hashUpdatesDir()
    }
}
