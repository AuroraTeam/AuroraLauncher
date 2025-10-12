import { Service } from "@freshgum/typedi";
import { LogHelper } from "@root/helpers";
import chalk from "chalk";

import { version } from "../../../../../package.json";
import { LangManager } from "../../../langs/LangManager";
import { AbstractCommand, CommandCategory } from "../../AbstractCommand";

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
