import { ModulesManager } from "@root/modules/ModulesManager"

import { AbstractCommand, Category } from "../AbstractCommand"

export class ModulesCommand extends AbstractCommand {
    constructor() {
        super("modules", "Outputs list of all loaded modules", Category.BASIC)
    }

    invoke(): void {
        ModulesManager.listModules()
    }
}
