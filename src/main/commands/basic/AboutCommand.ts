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
                    colors.yellow(require("../../../../package").version + " ")
            )
        )

        LogHelper.info("Source code " + colors.blue("https://gitlab.com/aurorateam/launcherserver"))
        LogHelper.info("Documentation " + colors.blue("https://aurora-launcher.ru/docs"))
        LogHelper.info("Discord channel " + colors.blue("https://aurora-launcher.ru/discord"))
    }
}
