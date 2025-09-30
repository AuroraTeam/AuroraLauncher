import { Service } from "@freshgum/typedi";
import { AbstractCommand, ClientsManager, CommandCategory, LangManager } from "@root/components";

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
            category: CommandCategory.UPDATES,
            usage: "<?client dir>",
        });
    }

    invoke(client?: string): void {
        this.clientsManager.hashClients(client);
    }
}
