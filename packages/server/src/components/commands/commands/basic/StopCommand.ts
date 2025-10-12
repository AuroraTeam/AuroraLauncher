import { Service } from "@freshgum/typedi";

import { LangManager } from "../../../langs/LangManager";
import { AbstractCommand, CommandCategory } from "../../AbstractCommand";

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
