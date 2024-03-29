import { UpdateManager } from "@root/components/update";
import { AbstractCommand, Category } from "@root/utils";
import { Service } from "typedi";

@Service()
export class UpdateCommand extends AbstractCommand {
    constructor(private readonly updateManager: UpdateManager) {
        super({
            name: "update",
            description: "Update LauncherServer",
            category: Category.BASIC,
        });
    }

    invoke(): void {
        this.updateManager.installUpdate();
    }
}
