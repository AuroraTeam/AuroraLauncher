import { App } from "../LauncherServer"
import { AbstractCommand, Category } from "./AbstractCommand"
import * as colors from "colors/safe"
import { LogHelper } from "../helpers/LogHelper"

export class HelpCommand extends AbstractCommand {
    name: string = "help"
    description: string = "Вывести список команд"
    category: Category = Category.BASIC
    usage: string

    invoke(): void {
        let commandsList: Map<Category, Array<AbstractCommand>> = new Map()
        App.CommandsManager.commands.forEach((value) => {
            let arr: Array<AbstractCommand> = commandsList.has(value.getCategory()) ?
                commandsList.get(value.getCategory()) : []
            arr.push(value)
            commandsList.set(value.getCategory(), arr)
        })

        commandsList.forEach((category, category_name) => {
            LogHelper.info(`=== [ ${category_name.toUpperCase()} ] ===`)
            category.forEach((command) => {
                LogHelper.info(colors.bold(command.name) + ` – ${command.description}`)
            })
        })
    }
}
