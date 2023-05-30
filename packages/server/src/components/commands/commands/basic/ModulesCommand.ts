import { AbstractCommand, Category, LogHelper } from "@root/utils";

export class ModulesCommand extends AbstractCommand {
    constructor() {
        // private readonly modulesManager: ModulesManager
        super({
            name: "modules",
            description: "Outputs list of all loaded modules",
            category: Category.BASIC,
        });
    }

    invoke(): void {
        // TODO Rework
        LogHelper.warn("rework");
        // this.modulesManager.listModules()
    }
}
