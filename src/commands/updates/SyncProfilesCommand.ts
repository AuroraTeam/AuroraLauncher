import { App } from "../../LauncherServer"
import { AbstractCommand, Category } from "../AbstractCommand"

export class SyncProfilesCommand extends AbstractCommand {
    constructor() {
        super({
            name: "syncprofiles",
            description: App.LangManager.getTranslate().CommandsManager.commands.updates.SyncProfilesCommand,
            category: Category.UPDATES,
        })
    }

    invoke(): void {
        App.ProfilesManager.reloadProfiles()
    }
}
