import { Service } from "@freshgum/typedi";
import { AbstractCommand, CommandCategory, LangManager } from "@root/components";
import { LogHelper } from "@root/utils";
import chalk from "chalk";

import { version } from "../../../../../package.json";

@Service([LangManager])
export class AboutCommand extends AbstractCommand {
    constructor(langManager: LangManager) {
        super({
            name: "about",
            description: langManager.getTranslate.CommandsManager.commands.basic.AboutCommand,
            category: CommandCategory.BASIC,
        });
    }

    invoke(): void {
        LogHelper.info(
            chalk.bold(
                chalk.cyan("AuroraLauncher ") +
                    chalk.green("LauncherServer ") +
                    "v" +
                    chalk.yellow(version),
            ),
        );

        LogHelper.info(
            "Source code: " + chalk.blue("https://github.com/AuroraTeam/LauncherServer"),
        );
        LogHelper.info("Documentation: " + chalk.blue("https://docs.aurora-launcher.ru"));
        LogHelper.info("Discord channel: " + chalk.blue("https://discord.aurora-launcher.ru"));
    }
}
