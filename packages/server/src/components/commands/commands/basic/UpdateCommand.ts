import { Service } from "@freshgum/typedi";

import { UpdateManager } from "../../../update/UpdateManager";
import { AbstractCommand, CommandCategory } from "../../AbstractCommand";

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
