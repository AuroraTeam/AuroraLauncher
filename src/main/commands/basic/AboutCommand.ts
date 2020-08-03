import * as colors from "colors/safe"

import { LogHelper } from "../../helpers/LogHelper"
import { VersionHelper } from "../../helpers/VersionHelper"
import { AbstractCommand, Category } from "../AbstractCommand"

export class AboutCommand extends AbstractCommand {
    constructor() {
        super("about", "Выводит информацию о продукте", Category.BASIC)
    }

    invoke(): void {
        LogHelper.info(
            colors.bold(
                colors.cyan("AuroraLauncher ") +
                    colors.green("LauncherServer ") +
                    "v" +
                    colors.yellow(`${VersionHelper.getVersion()} `)
            )
        )

        LogHelper.info("Source code " + colors.blue("https://gitlab.com/aurorateam/launcherserver"))
        LogHelper.info("Documentation " + colors.blue("https://aurora-launcher.ru/docs"))
        LogHelper.info("Discord channel " + colors.blue("https://aurora-launcher.ru/discord"))
    }
}
