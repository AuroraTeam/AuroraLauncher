import { ClientsManager, LangManager } from "@root/components";
import { AbstractCommand, Category } from "@root/utils";
import { Service } from "typedi";

@Service()
export class SyncClientsCommand extends AbstractCommand {
    constructor(
        langManager: LangManager,
        private readonly clientsManager: ClientsManager,
    ) {
        super({
            name: "syncclients",
            description:
                langManager.getTranslate.CommandsManager.commands.updates.SyncUpdatesCommand,
            category: Category.UPDATES,
        });
    }

    invoke(): void {
        this.clientsManager.hashClients();
    }
}
