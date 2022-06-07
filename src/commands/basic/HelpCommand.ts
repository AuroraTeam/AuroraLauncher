import chalk from "chalk"

import { LogHelper } from "../../helpers/LogHelper"
import { App } from "../../LauncherServer"
import { AbstractCommand, Category } from "../AbstractCommand"

export class HelpCommand extends AbstractCommand {
    constructor() {
        super({
            name: "help",
            description: App.LangManager.getTranslate().CommandsManager.commands.basic.HelpCommand,
            category: Category.BASIC,
        })
    }

    invoke(): void {
        const commandsList: Map<Category, AbstractCommand[]> = new Map(Object.values(Category).map((c) => [c, []]))
        Array.from(App.CommandsManager.commands.values()).forEach((command) => {
            commandsList.get(command.conf.category).push(command)
        })

        commandsList.forEach((category, category_name) => {
            if (category.length === 0) return
            LogHelper.info(`=== [ %s ] ===`, category_name.toUpperCase())
            category.forEach((command) => {
                LogHelper.info(
                    `${chalk.bold(command.conf.name)}${
                        command.conf.usage.length === 0 ? command.conf.usage : chalk.red(" " + command.conf.usage)
                    } - ${command.conf.description}`
                )
            })
        })
    }
}
