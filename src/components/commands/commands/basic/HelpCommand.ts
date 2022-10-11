import { AbstractCommand, Category, LogHelper } from "@root/utils"
import { App } from "@root/app"
import chalk from "chalk"

export class HelpCommand extends AbstractCommand {
    constructor() {
        super({
            name: "help",
            description: App.LangManager.getTranslate.CommandsManager.commands.basic.HelpCommand,
            category: Category.BASIC,
        })
    }

    invoke(): void {
        const commandsList: Map<Category, AbstractCommand[]> = new Map(Object.values(Category).map((c) => [c, []]))
        Array.from(App.CommandsManager.commands.values()).forEach((command: AbstractCommand) => {
            commandsList.get(command.info.category).push(command)
        })

        commandsList.forEach((category, category_name) => {
            if (category.length === 0) return
            LogHelper.info(`=== [ %s ] ===`, category_name.toUpperCase())
            category.forEach((command: AbstractCommand) => {
                LogHelper.info(
                    `${chalk.bold(command.info.name)}${!command.info.usage ? "" : chalk.red(" ", command.info.usage)} - ${
                        command.info.description
                    }`
                )
            })
        })
    }
}
