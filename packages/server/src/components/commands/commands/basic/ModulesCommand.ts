import { Service } from "@freshgum/typedi";
import { LogHelper } from "@root/helpers";

import { AbstractCommand, CommandCategory } from "../../AbstractCommand";

@Service([])
export class ModulesCommand extends AbstractCommand {
    constructor() {
        // private readonly modulesManager: ModulesManager
        super({
            name: "modules",
            description: "Outputs list of all loaded modules",
            category: CommandCategory.BASIC,
        });
    }

    invoke(): void {
        // TODO Rework
        LogHelper.warn("rework");
        // this.modulesManager.listModules()
    }
}
