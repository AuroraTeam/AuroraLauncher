import { LangManager } from "@root/components/langs";
import { AbstractCommand, Category, LogHelper } from "@root/utils";
import { Service } from "typedi";

@Service()
export class StatusCommand extends AbstractCommand {
    constructor(langManager: LangManager) {
        super({
            name: "status",
            description: langManager.getTranslate.CommandsManager.commands.basic.StatusCommand,
            category: Category.BASIC,
        });
    }

    invoke(): void {
        LogHelper.info("Method not implemented");
    }
}
