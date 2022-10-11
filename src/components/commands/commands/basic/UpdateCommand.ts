import { App } from "@root/app"
import { AbstractCommand, Category } from "@root/utils"

export class UpdateCommand extends AbstractCommand {
    constructor() {
        super({
            name: "update",
            description: "Update LauncherServer",
            category: Category.BASIC,
        })
    }

    invoke(): void {
        App.UpdateManager.installUpdate()
    }
}
