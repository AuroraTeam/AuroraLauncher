import { Service } from "@freshgum/typedi";

import { ClientsManager } from "../../../clients/ClientsManager";
import { LangManager } from "../../../langs/LangManager";
import { AbstractCommand, CommandCategory } from "../../AbstractCommand";

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
