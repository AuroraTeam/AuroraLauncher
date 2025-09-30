import { Service } from "@freshgum/typedi";
import {
    AbstractCommand,
    ClientsManager,
    CommandCategory,
    LangManager,
    ProfilesManager,
} from "@root/components";

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
