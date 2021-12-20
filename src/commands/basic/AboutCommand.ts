import { blue, bold, cyan, green, yellow } from "colors/safe"

import { version } from "../../../package.json"
import { LogHelper } from "../../helpers/LogHelper"
import { AbstractCommand, Category } from "../AbstractCommand"

export class AboutCommand extends AbstractCommand {
    constructor() {
        super("about", "Выводит информацию о продукте", Category.BASIC)
    }

    invoke(): void {
        LogHelper.info(bold(cyan("AuroraLauncher ") + green("LauncherServer ") + "v" + yellow(version)))

        LogHelper.info("Source code: " + blue("https://github.com/AuroraTeam/LauncherServer"))
        LogHelper.info("Documentation: " + blue("https://docs.aurora-launcher.ru"))
        LogHelper.info("Discord channel: " + blue("https://discord.aurora-launcher.ru"))
    }
}
