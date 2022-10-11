import { App } from "@root/app"
import { AbstractCommand, Category } from "@root/utils"

export class SyncAllCommand extends AbstractCommand {
    constructor() {
        super({
            name: "syncall",
            description:
                App.LangManager.getTranslate.CommandsManager.commands.updates
                    .SyncAllCommand,
            category: Category.UPDATES,
        })
    }

    invoke(): void {
        App.ProfilesManager.reloadProfiles()
        App.InstancesManager.hashInstancesDir()
    }
}
