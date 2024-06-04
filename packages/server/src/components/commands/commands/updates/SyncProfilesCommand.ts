import { LangManager, ProfilesManager } from "@root/components";
import { AbstractCommand, Category } from "@root/utils";
import { Service } from "typedi";

@Service()
export class SyncProfilesCommand extends AbstractCommand {
    constructor(
        langManager: LangManager,
        private readonly profilesManager: ProfilesManager,
    ) {
        super({
            name: "syncprofiles",
            description:
                langManager.getTranslate.CommandsManager.commands.updates.SyncProfilesCommand,
            category: Category.UPDATES,
            usage: '<?name profiles>'
        });
    }

    invoke(profile?:string): void {
        this.profilesManager.reloadProfiles(profile);
    }
}
