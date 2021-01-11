/**
 * AuroraLauncher LauncherServer - Server for AuroraLauncher
 * Copyright (C) 2020 - 2021 AuroraTeam

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
