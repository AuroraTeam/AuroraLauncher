import { App } from "../../LauncherServer"
import { AbstractCommand, Category } from "../AbstractCommand"

export class SyncUpCommand extends AbstractCommand {
    constructor() {
        super("syncup", "Синхронизировать папки updates & profiles", Category.UPDATES)
    }

    invoke(): void {
        App.ProfilesManager.reloadProfiles()
        App.UpdatesManager.hashUpdatesDir()
    }
}
