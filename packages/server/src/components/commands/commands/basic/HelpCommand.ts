import { Service } from "@freshgum/typedi";
import { LogHelper } from "@root/helpers";
import chalk from "chalk";

import { LangManager } from "../../../langs/LangManager";
import { AbstractCommand, CommandCategory } from "../../AbstractCommand";
import { CommandsManager } from "../../CommandsManager";

@Service([LangManager, CommandsManager])
export class HelpCommand extends AbstractCommand {
    constructor(
        langManager: LangManager,
        private readonly commandsManager: CommandsManager,
    ) {
        super({
            name: "help",
            description: langManager.getTranslate.CommandsManager.commands.basic.HelpCommand,
            category: CommandCategory.BASIC,
        });
    }

    invoke(): void {
        const commandsList: Map<CommandCategory, AbstractCommand[]> = new Map(
            Object.values(CommandCategory).map((c) => [c, <AbstractCommand[]>[]]),
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
                    `${chalk.bold(command.info.name)}${usage} - ${command.info.description}`,
                );
            });
        });
    }
}
