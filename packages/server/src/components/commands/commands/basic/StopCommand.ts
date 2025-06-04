import { Service } from "@freshgum/typedi";
import { LangManager } from "@root/components/langs";
import { AbstractCommand, Category } from "@root/utils";

@Service([])
export class StopCommand extends AbstractCommand {
    constructor(langManager: LangManager) {
        super({
            name: "stop",
            description: langManager.getTranslate.CommandsManager.commands.basic.StopCommand,
            category: Category.BASIC,
        });
    }

    invoke(): void {
        process.exit(0);
    }
}
