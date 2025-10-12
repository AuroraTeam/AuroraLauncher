import { Service } from "@freshgum/typedi";

import { LangManager } from "../../../langs/LangManager";
import { ProfilesManager } from "../../../profiles/ProfilesManager";
import { AbstractCommand, CommandCategory } from "../../AbstractCommand";

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
