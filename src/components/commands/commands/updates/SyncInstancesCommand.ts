import { ClientsManager, LangManager } from "@root/components";
import { AbstractCommand, Category } from "@root/utils";
import { injectable } from "tsyringe";

@injectable()
export class SyncInstancesCommand extends AbstractCommand {
    constructor(
        langManager: LangManager,
        private readonly instancesManager: ClientsManager
    ) {
        super({
            name: "syncinstances",
            description:
                langManager.getTranslate.CommandsManager.commands.updates
                    .SyncUpdatesCommand,
            category: Category.UPDATES,
        });
    }

    invoke(): void {
        this.instancesManager.hashInstancesDir("instances");
    }
}
