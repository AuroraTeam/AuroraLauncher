import { LangManager } from "@root/components/langs";
import { AbstractCommand, Category, LogHelper } from "@root/utils";
import chalk from "chalk";
import { delay, inject, injectable } from "tsyringe";

import { CommandsManager } from "../..";

@injectable()
export class HelpCommand extends AbstractCommand {
    constructor(
        langManager: LangManager,
        @inject(delay(() => CommandsManager))
        private readonly commandsManager: CommandsManager
    ) {
        super({
            name: "help",
            description:
                langManager.getTranslate.CommandsManager.commands.basic
                    .HelpCommand,
            category: Category.BASIC,
        });
    }

    invoke(): void {
        const commandsList: Map<Category, AbstractCommand[]> = new Map(
            Object.values(Category).map((c) => [c, []])
        );

        this.commandsManager.commands.forEach((command: AbstractCommand) => {
            commandsList.get(command.info.category)?.push(command);
        });

        commandsList.forEach((category, categoryName) => {
            if (category.length === 0) return;
            LogHelper.info(`=== [ ${categoryName.toUpperCase()} ] ===`);
            category.forEach((command: AbstractCommand) => {
                const usage = command.info.usage ? ` ${chalk.red(command.info.usage)}` : "";
                LogHelper.info(
                    `${chalk.bold(command.info.name)}${usage} - ${command.info.description}`
                );
            });
        });
    }
}
