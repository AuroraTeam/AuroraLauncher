import { LangManager } from "@root/components/langs"
import { AbstractCommand, Category, LogHelper } from "@root/utils"
import chalk from "chalk"

import { CommandsManager } from "../.."

export class HelpCommand extends AbstractCommand {
    constructor(
        langManager: LangManager,
        private readonly commandsManager: CommandsManager
    ) {
        super({
            name: "help",
            description:
                langManager.getTranslate.CommandsManager.commands.basic
                    .HelpCommand,
            category: Category.BASIC,
        })
    }

    invoke(): void {
        const commandsList: Map<Category, AbstractCommand[]> = new Map(
            Object.values(Category).map((c) => [c, []])
        )
        Array.from(this.commandsManager.commands.values()).forEach(
            (command: AbstractCommand) => {
                commandsList.get(command.info.category).push(command)
            }
        )

        commandsList.forEach((category, category_name) => {
            if (category.length === 0) return
            LogHelper.info(`=== [ %s ] ===`, category_name.toUpperCase())
            category.forEach((command: AbstractCommand) => {
                LogHelper.info(
                    `${chalk.bold(command.info.name)}${
                        !command.info.usage
                            ? ""
                            : chalk.red(" ", command.info.usage)
                    } - ${command.info.description}`
                )
            })
        })
    }
}
