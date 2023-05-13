import { LangManager } from "@root/components/langs";
import { AbstractCommand, Category, LogHelper } from "@root/utils";
import chalk from "chalk";
import { injectable } from "tsyringe";

import { version } from "../../../../../package.json";

@injectable()
export class AboutCommand extends AbstractCommand {
    constructor(langManager: LangManager) {
        super({
            name: "about",
            description:
                langManager.getTranslate.CommandsManager.commands.basic
                    .AboutCommand,
            category: Category.BASIC,
        });
    }

    invoke(): void {
        LogHelper.info(
            chalk.bold(
                chalk.cyan("AuroraLauncher ") +
                    chalk.green("LauncherServer ") +
                    "v" +
                    chalk.yellow(version)
            )
        );

        LogHelper.info(
            "Source code: " +
                chalk.blue("https://github.com/AuroraTeam/LauncherServer")
        );
        LogHelper.info(
            "Documentation: " + chalk.blue("https://docs.aurora-launcher.ru")
        );
        LogHelper.info(
            "Discord channel: " +
                chalk.blue("https://discord.aurora-launcher.ru")
        );
    }
}
