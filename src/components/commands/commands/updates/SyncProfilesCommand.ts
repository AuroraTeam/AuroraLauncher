import { App } from "@root/app"
import { AbstractCommand, Category } from "@root/utils"

export class SyncProfilesCommand extends AbstractCommand {
    constructor() {
        super({
            name: "syncprofiles",
            description: App.LangManager.getTranslate.CommandsManager.commands.updates.SyncProfilesCommand,
            category: Category.UPDATES,
        })
    }

    invoke(): void {
        App.ProfilesManager.reloadProfiles()
    }
}
