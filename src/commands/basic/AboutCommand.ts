import { LogHelper } from "@root/helpers"
import { App } from "@root/LauncherServer"
import chalk from "chalk"

import { version } from "../../../package.json"
import { AbstractCommand, Category } from "../AbstractCommand"

export class AboutCommand extends AbstractCommand {
    constructor() {
        super("about", App.LangManager.getTranslate().CommandsManager.commands.basic.AboutCommand, Category.BASIC)
    }

    invoke(): void {
        LogHelper.info(
            chalk.bold(chalk.cyan("AuroraLauncher ") + chalk.green("LauncherServer ") + "v" + chalk.yellow(version))
        )

        LogHelper.info("Source code: " + chalk.blue("https://github.com/AuroraTeam/LauncherServer"))
        LogHelper.info("Documentation: " + chalk.blue("https://docs.aurora-launcher.ru"))
        LogHelper.info("Discord channel: " + chalk.blue("https://discord.aurora-launcher.ru"))
    }
}
