import { InstancesManager, LangManager } from "@root/components"
import { AbstractCommand, Category } from "@root/utils"

export class SyncInstancesCommand extends AbstractCommand {
    constructor(
        langManager: LangManager,
        private readonly instancesManager: InstancesManager
    ) {
        super({
            name: "syncinstances",
            description:
                langManager.getTranslate.CommandsManager.commands.updates
                    .SyncUpdatesCommand,
            category: Category.UPDATES,
        })
    }

    invoke(): void {
        this.instancesManager.hashInstancesDir()
    }
}
