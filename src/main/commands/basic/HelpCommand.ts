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
import { App } from "../../LauncherServer"
import { AbstractCommand, Category } from "../AbstractCommand"

export class HelpCommand extends AbstractCommand {
    constructor() {
        super("help", "Выводит список команд", Category.BASIC)
    }

    invoke(): void {
        const commandsList: Map<Category, AbstractCommand[]> = new Map(Object.values(Category).map((c) => [c, []]))
        Array.from(App.CommandsManager.commands.values()).forEach((command) => {
            commandsList.get(command.getCategory()).push(command)
        })

        commandsList.forEach((category, category_name) => {
            if (category.length === 0) return
            LogHelper.info(`=== [ %s ] ===`, category_name.toUpperCase())
            category.forEach((command) => {
                LogHelper.info(
                    `${colors.bold(command.getName())}${
                        command.getUsage() == undefined ? "" : colors.red(" " + command.getUsage())
                    } - ${command.getDescription()}`
                )
            })
        })
    }
}
