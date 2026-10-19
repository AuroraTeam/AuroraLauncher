import { Service } from "@freshgum/typedi";
import { ShutdownToken } from "@root/tokens";

import { LangManager } from "../../../langs/LangManager";
import { AbstractCommand, CommandCategory } from "../../AbstractCommand";

@Service([LangManager, ShutdownToken])
export class StopCommand extends AbstractCommand {
    constructor(
        langManager: LangManager,
        private readonly shutdown: () => Promise<void>,
    ) {
        super({
            name: "stop",
            description: langManager.getTranslate.CommandsManager.commands.basic.StopCommand,
            category: CommandCategory.BASIC,
        });
    }

    async invoke(): Promise<void> {
        await this.shutdown();
    }
}
