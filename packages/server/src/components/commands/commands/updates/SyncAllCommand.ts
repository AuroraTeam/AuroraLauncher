import { Service } from "@freshgum/typedi";

import { ClientsManager } from "../../../clients/ClientsManager";
import { LangManager } from "../../../langs/LangManager";
import { ProfilesManager } from "../../../profiles/ProfilesManager";
import { AbstractCommand, CommandCategory } from "../../AbstractCommand";

@Service([LangManager, ProfilesManager, ClientsManager])
export class SyncAllCommand extends AbstractCommand {
    constructor(
        langManager: LangManager,
        private readonly profilesManager: ProfilesManager,
        private readonly clientsManager: ClientsManager,
    ) {
        super({
            name: "syncall",
            description: langManager.getTranslate.CommandsManager.commands.updates.SyncAllCommand,
            category: CommandCategory.UPDATES,
        });
    }

    invoke(): void {
        this.profilesManager.reloadProfiles();
        this.clientsManager.hashClients();
    }
}
