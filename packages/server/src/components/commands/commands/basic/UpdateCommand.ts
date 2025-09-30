import { Service } from "@freshgum/typedi";
import { AbstractCommand, CommandCategory, UpdateManager } from "@root/components";

@Service([UpdateManager])
export class UpdateCommand extends AbstractCommand {
    constructor(private readonly updateManager: UpdateManager) {
        super({
            name: "update",
            description: "Update LauncherServer",
            category: CommandCategory.BASIC,
        });
    }

    invoke(): void {
        this.updateManager.installUpdate();
    }
}
