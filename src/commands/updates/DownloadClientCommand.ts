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

import { FabricManager } from "../../download/FabricManager"
import { MirrorManager } from "../../download/MirrorManager"
import { MojangManager } from "../../download/MojangManager"
import { LogHelper } from "../../helpers/LogHelper"
import { App } from "../../LauncherServer"
import { AbstractCommand, Category } from "../AbstractCommand"

export class DownloadClientCommand extends AbstractCommand {
    constructor() {
        super("downloadclient", "Загрузить клиент", Category.UPDATES, "<source type> <version> <folder name>")
    }

    async invoke(...args: string[]): Promise<void> {
        const [sourceType, clientName, dirName] = args
        if (!sourceType) return LogHelper.error("Укажите тип источника!")
        if (!clientName) return LogHelper.error("Укажите название/версию клиента!")
        if (!dirName) return LogHelper.error("Укажите название папки для клиента!")

        App.CommandsManager.console.pause()
        switch (sourceType) {
            case "mirror":
                await new MirrorManager().downloadClient(clientName, dirName)
                break
            case "fabric":
                await new FabricManager().downloadClient(clientName, dirName)
                break
            case "mojang":
            default:
                await new MojangManager().downloadClient(clientName, dirName)
                break
        }
        App.CommandsManager.console.resume()
    }
}
