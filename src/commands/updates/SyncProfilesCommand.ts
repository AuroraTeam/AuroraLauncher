import { App } from "../../LauncherServer"
import { AbstractCommand, Category } from "../AbstractCommand"

export class SyncProfilesCommand extends AbstractCommand {
    constructor() {
        super("syncprofiles", "Синхронизировать папку profiles", Category.UPDATES)
    }

    invoke(): void {
        App.ProfilesManager.reloadProfiles()
    }
}
