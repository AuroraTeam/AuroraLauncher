import { LangManager } from "@root/components/langs"
import { UpdateManager } from "@root/components/update"
import { AbstractCommand, Category } from "@root/utils"

export class UpdateCommand extends AbstractCommand {
    constructor(
        langManager: LangManager,
        private readonly updateManager: UpdateManager
    ) {
        super({
            name: "update",
            description: "Update LauncherServer",
            category: Category.BASIC,
        })
    }

    invoke(): void {
        this.updateManager.installUpdate()
    }
}
