import { AbstractCommand, Category } from "./AbstractCommand"
import * as colors from "colors/safe"

export class HelpCommand extends AbstractCommand {
    name: string = "help"
    description: string = "Вывести список команд"
    category: Category = Category.BASIC
    usage: string

    execute(): void {
        let commandsList: Map<Category, Array<AbstractCommand>> = new Map;
        this.ls.CommandsManager.commands.forEach((value) => {
            let arr: Array<AbstractCommand> = [];
            if (commandsList.has(value.getCategory())) arr = commandsList.get(value.getCategory())
            arr.push(value)
            commandsList.set(value.getCategory(), arr)
        })

        commandsList.forEach((category, category_name) => {
            console.log(`=== ${category_name} ===`)
            category.forEach((command) => {
                console.log(
                    colors.bold(command.name) +
                    ` – ${command.description}`
                )
            })
        })

    }
}