import { Service } from "@freshgum/typedi";
import { AbstractCommand, CommandCategory, LangManager } from "@root/components";

@Service([LangManager])
export class StopCommand extends AbstractCommand {
    constructor(langManager: LangManager) {
        super({
            name: "stop",
            description: langManager.getTranslate.CommandsManager.commands.basic.StopCommand,
            category: CommandCategory.BASIC,
        });
    }

    invoke(): void {
        process.exit(0);
    }
}
