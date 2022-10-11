import { ModulesManager } from "@root/components"
import { AbstractCommand, Category } from "@root/utils"

export class ModulesCommand extends AbstractCommand {
    constructor() {
        super({
            name: "modules",
            description: "Outputs list of all loaded modules",
            category: Category.BASIC,
        })
    }

    invoke(): void {
        ModulesManager.listModules()
    }
}
