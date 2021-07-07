import { App } from "../../LauncherServer"
import { AbstractCommand, Category } from "../AbstractCommand"

export class SyncUpdatesCommand extends AbstractCommand {
    constructor() {
        super("syncupdates", "Синхронизировать папку updates", Category.UPDATES)
    }

    invoke(): void {
        App.UpdatesManager.hashUpdatesDir()
    }
}
