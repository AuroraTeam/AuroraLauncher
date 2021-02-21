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

import * as ReadLine from "readline"

import { LogHelper } from "../helpers/LogHelper"
import { App } from "../LauncherServer"
import { AbstractCommand } from "./AbstractCommand"
import { AboutCommand } from "./basic/AboutCommand"
import { HelpCommand } from "./basic/HelpCommand"
import { LicenseCommand } from "./basic/LicenseCommand"
import { StopCommand } from "./basic/StopCommand"
import { DownloadAssetsCommand } from "./updates/DownloadAssetsCommand"
import { DownloadClientCommand } from "./updates/DownloadClientCommand"
import { DownloadFabricClientCommand } from "./updates/DownloadFabricClientCommand"
import { DownloadMojangAssetsCommand } from "./updates/DownloadMojangAssetsCommand"
import { DownloadMojangClientCommand } from "./updates/DownloadMojangClientCommand"
import { SyncProfilesCommand } from "./updates/SyncProfilesCommand"
import { SyncUpdatesCommand } from "./updates/SyncUpdatesCommand"

export class CommandsManager {
    commands: Map<string, AbstractCommand> = new Map()
    console: ReadLine.Interface

    constructor() {
        this.commandsInit()
        this.consoleInit()
    }

    private commandsInit(): void {
        this.registerCommand(new StopCommand())
        this.registerCommand(new AboutCommand())
        this.registerCommand(new HelpCommand())
        this.registerCommand(new DownloadClientCommand())
        this.registerCommand(new DownloadAssetsCommand())
        this.registerCommand(new SyncUpdatesCommand())
        this.registerCommand(new SyncProfilesCommand())
        this.registerCommand(new LicenseCommand())
        this.registerCommand(new DownloadMojangAssetsCommand())
        this.registerCommand(new DownloadMojangClientCommand())
        this.registerCommand(new DownloadFabricClientCommand())
    }

    registerCommand(x: AbstractCommand): void {
        this.commands.set(x.getName(), x)
    }

    private consoleInit(): void {
        this.console = ReadLine.createInterface({
            input: process.stdin,
            output: process.stdout,
            completer: (line: string) => {
                const completions = Array.from(this.commands.keys())
                const hits = completions.filter((c) => c.startsWith(line.toLowerCase()))
                return [hits.length ? hits : completions, line]
            },
            prompt: "",
        })
        this.console.on("line", (line) => {
            const args = line.trim().split(/ +/)
            const cmd = args.shift().toLowerCase()
            if (!this.commands.has(cmd))
                return LogHelper.error(App.LangManager.getTranslate("CommandsManager.cmdNotFound"), cmd)
            LogHelper.dev(App.LangManager.getTranslate("CommandsManager.invokeCmd"), cmd)
            this.commands.get(cmd).invoke(...args)
        })
    }
}
