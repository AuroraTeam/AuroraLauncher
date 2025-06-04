import { Service } from "@freshgum/typedi";
import { ClientsManager, LangManager } from "@root/components";
import { AbstractCommand, Category } from "@root/utils";

@Service([LangManager, ClientsManager])
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
            usage: "<?client dir>",
        });
    }

    invoke(client?: string): void {
        this.clientsManager.hashClients(client);
    }
}
