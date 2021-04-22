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

import "source-map-support/register"
import "reflect-metadata"

import { EventEmitter } from "events"

import * as colors from "colors/safe"

import { SocketManager } from "./api/SocketManager"
import { AuthManager } from "./auth/AuthManager"
import { CommandsManager } from "./commands/CommandsManager"
import { ConfigManager } from "./config/ConfigManager"
import { LogHelper } from "./helpers/LogHelper"
import { StorageHelper } from "./helpers/StorageHelper"
import { LangManager } from "./langs/LangManager"
import { ModulesManager } from "./modules/ModulesManager"
import { ProfilesManager } from "./profiles/ProfilesManager"
import { UpdatesManager } from "./updates/UpdatesManager"

const version = require("../../package").version

export class LauncherServer extends EventEmitter {
    private _ConfigManager: ConfigManager
    private _LangManager: LangManager
    private _AuthManager: AuthManager
    private _CommandsManager: CommandsManager
    private _ModulesManager: ModulesManager
    private _SocketManager: SocketManager
    private _UpdatesManager: UpdatesManager
    private _ProfilesManager: ProfilesManager

    private inited = false

    main(): void {
        if (this.inited) return
        StorageHelper.createMissing()
        LogHelper.raw(
            colors.bold(
                colors.cyan("AuroraLauncher ") +
                    colors.green("LauncherServer ") +
                    "v" +
                    colors.yellow(version) +
                    colors.green("\nCopyright (C) 2020 - 2021 ") +
                    colors.blue("AuroraTeam (https://github.com/AuroraTeam)") +
                    colors.green(
                        "\nThis program comes with ABSOLUTELY NO WARRANTY; for details type `license w'." +
                            "\nThis is free software, and you are welcome to redistribute it under certain conditions; type `license c' for details."
                    ) +
                    colors.green("\nDocumentation page ") +
                    colors.blue("https://aurora-launcher.ru/wiki")
            )
        )
        LogHelper.info("Initialization start")
        this._ConfigManager = new ConfigManager()
        this._LangManager = new LangManager()
        this._AuthManager = new AuthManager()
        this._CommandsManager = new CommandsManager()
        this._ModulesManager = new ModulesManager()
        this._SocketManager = new SocketManager()
        this._UpdatesManager = new UpdatesManager()
        this._ProfilesManager = new ProfilesManager()
        this.emit("postInit")
        LogHelper.info(this.LangManager.getTranslate().LauncherServer.initEnd)
        this.inited = true
    }

    get ConfigManager(): ConfigManager {
        return this._ConfigManager
    }

    get LangManager(): LangManager {
        return this._LangManager
    }

    get AuthManager(): AuthManager {
        return this._AuthManager
    }

    get CommandsManager(): CommandsManager {
        return this._CommandsManager
    }

    get ModulesManager(): ModulesManager {
        return this._ModulesManager
    }

    get SocketManager(): SocketManager {
        return this._SocketManager
    }

    get UpdatesManager(): UpdatesManager {
        return this._UpdatesManager
    }

    get ProfilesManager(): ProfilesManager {
        return this._ProfilesManager
    }
}

export const App = new LauncherServer()
App.main()

export declare interface LauncherServer {
    on(event: "postInit", listener: () => void): this
    once(event: "postInit", listener: () => void): this
    addListener(event: "postInit", listener: () => void): this
    removeListener(event: "postInit", listener: () => void): this
    emit(event: "postInit"): boolean

    /* eslint-disable @typescript-eslint/adjacent-overload-signatures */
    on(event: "close", listener: () => void): this
    once(event: "close", listener: () => void): this
    addListener(event: "close", listener: () => void): this
    removeListener(event: "close", listener: () => void): this
    emit(event: "close"): boolean
}
