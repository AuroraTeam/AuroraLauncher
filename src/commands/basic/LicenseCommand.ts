import * as colors from "colors/safe"

import { LogHelper } from "../../helpers/LogHelper"
import { AbstractCommand, Category } from "../AbstractCommand"

export class LicenseCommand extends AbstractCommand {
    constructor() {
        super("license", "Выводит информацию о лицензии", Category.BASIC)
    }

    invoke(...[cmd]: string[]): void {
        if (cmd === "w") {
            LogHelper.raw(
                colors.bold(
                    colors.green("More info: https://github.com/AuroraTeam/LauncherServer/blob/master/LICENSE#L589")
                )
            )
        } else if (cmd === "c") {
            LogHelper.raw(
                colors.bold(
                    colors.green("More info: https://github.com/AuroraTeam/LauncherServer/blob/master/LICENSE#L71")
                )
            )
        } else {
            LogHelper.raw(
                colors.bold(
                    colors.cyan("AuroraLauncher ") +
                        colors.green("LauncherServer ") +
                        colors.blue("Copyright (C) 2020 - 2021 AuroraTeam") +
                        colors.green(
                            "\nThis program comes with ABSOLUTELY NO WARRANTY; for details type `license w'." +
                                "\nThis is free software, and you are welcome to redistribute it under certain conditions; type `license c' for details."
                        )
                )
            )
        }
    }
}
