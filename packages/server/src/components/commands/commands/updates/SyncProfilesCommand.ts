import { Service } from "@freshgum/typedi";
import { AbstractCommand, CommandCategory, LangManager, ProfilesManager } from "@root/components";

@Service([LangManager, ProfilesManager])
export class SyncProfilesCommand extends AbstractCommand {
    constructor(
        langManager: LangManager,
        private readonly profilesManager: ProfilesManager,
    ) {
        super({
            name: "syncprofiles",
            description:
                langManager.getTranslate.CommandsManager.commands.updates.SyncProfilesCommand,
            category: CommandCategory.UPDATES,
        });
    }

    invoke(): void {
        this.profilesManager.reloadProfiles();
    }
}
