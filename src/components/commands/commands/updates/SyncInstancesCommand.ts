import { App } from "@root/app"
import { AbstractCommand, Category } from "@root/utils"

export class SyncInstancesCommand extends AbstractCommand {
    constructor() {
        super({
            name: "syncinstances",
            description: App.LangManager.getTranslate.CommandsManager.commands.updates.SyncUpdatesCommand,
            category: Category.UPDATES,
        })
    }

    invoke(): void {
        App.InstancesManager.hashInstancesDir()
    }
}
