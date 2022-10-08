import { App } from "@root/LauncherServer"

import { AbstractCommand, Category } from "../AbstractCommand"

export class SyncProfilesCommand extends AbstractCommand {
    constructor() {
        super(
            "syncprofiles",
            App.LangManager.getTranslate.CommandsManager.commands.updates.SyncProfilesCommand,
            Category.UPDATES
        )
    }

    invoke(): void {
        App.ProfilesManager.reloadProfiles()
    }
}
