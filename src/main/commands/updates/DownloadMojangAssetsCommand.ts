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

import { MojangManager } from "../../download/MojangManager"
import { LogHelper } from "../../helpers/LogHelper"
import { App } from "../../LauncherServer"
import { AbstractCommand, Category } from "../AbstractCommand"

export class DownloadMojangAssetsCommand extends AbstractCommand {
    constructor() {
        super("downloadmojangassets", "Загрузить ресурсы с зеркала Mojang", Category.UPDATES, "<version> <folder name>")
    }

    async invoke(...args: string[]): Promise<void> {
        const [assetsVer, dirName] = args
        if (!assetsVer) return LogHelper.error("Укажите название/версию ассетов!")
        if (!dirName) return LogHelper.error("Укажите название папки для ассетов!")
        App.CommandsManager.console.pause()
        await new MojangManager().downloadAssets(assetsVer, dirName)
        App.CommandsManager.console.resume()
    }
}
