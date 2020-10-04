import * as colors from "colors/safe"

import { LogHelper } from "../../helpers/LogHelper"
import { App } from "../../LauncherServer"
import { AbstractCommand, Category } from "../AbstractCommand"

export class HelpCommand extends AbstractCommand {
    constructor() {
        super("help", "Выводит список команд", Category.BASIC)
    }

    invoke(): void {
        // TODO Сделать понятней
        const commandsList: Map<Category, Array<AbstractCommand>> = new Map()
        App.CommandsManager.commands.forEach((value) => {
            const arr: Array<AbstractCommand> = commandsList.has(value.getCategory())
                ? commandsList.get(value.getCategory())
                : []
            arr.push(value)
            commandsList.set(value.getCategory(), arr)
        })

        commandsList.forEach((category, category_name) => {
            LogHelper.info(`=== [ ${category_name.toUpperCase()} ] ===`)
            category.forEach((command) => {
                LogHelper.info(
                    `${colors.bold(command.getName())}${
                        command.getUsage() == undefined ? "" : colors.red(" " + command.getUsage())
                    } - ${command.getDescription()}`
                )
            })
        })
    }
}
