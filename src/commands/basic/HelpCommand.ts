import chalk from "chalk"

import { LogHelper } from "../../helpers/LogHelper"
import { App } from "../../LauncherServer"
import { AbstractCommand, Category } from "../AbstractCommand"

export class HelpCommand extends AbstractCommand {
    constructor() {
        super("help", "Выводит список команд", Category.BASIC)
    }

    invoke(): void {
        const commandsList: Map<Category, AbstractCommand[]> = new Map(Object.values(Category).map((c) => [c, []]))
        Array.from(App.CommandsManager.commands.values()).forEach((command) => {
            commandsList.get(command.getCategory()).push(command)
        })

        commandsList.forEach((category, category_name) => {
            if (category.length === 0) return
            LogHelper.info(`=== [ %s ] ===`, category_name.toUpperCase())
            category.forEach((command) => {
                LogHelper.info(
                    `${chalk.bold(command.getName())}${
                        command.getUsage() == undefined ? "" : chalk.red(" " + command.getUsage())
                    } - ${command.getDescription()}`
                )
            })
        })
    }
}
