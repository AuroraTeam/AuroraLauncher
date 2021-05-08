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

import * as fs from "fs"
import * as path from "path"

export class StorageHelper {
    static readonly storageDir: string = __dirname
    static readonly updatesDir: string = path.resolve(StorageHelper.storageDir, "updates")
    static readonly profilesDir: string = path.resolve(StorageHelper.storageDir, "profiles")
    static readonly modulesDir: string = path.resolve(StorageHelper.storageDir, "modules")
    // static readonly runtimeDir: string = path.resolve(StorageHelper.storageDir, "runtime") // TODO auto download
    static readonly authlibDir: string = path.resolve(StorageHelper.storageDir, "authlib")
    static readonly logsDir: string = path.resolve(StorageHelper.storageDir, "logs")
    static readonly tempDir: string = path.resolve(StorageHelper.storageDir, "temp")
    static readonly configFile: string = path.resolve(StorageHelper.storageDir, "LauncherServerConfig.json")
    static readonly logFile: string = path.resolve(StorageHelper.logsDir, "LauncherServer.log")

    static createMissing(): void {
        if (!fs.existsSync(this.updatesDir)) fs.mkdirSync(this.updatesDir)
        if (!fs.existsSync(this.profilesDir)) fs.mkdirSync(this.profilesDir)
        if (!fs.existsSync(this.modulesDir)) fs.mkdirSync(this.modulesDir)
        // if (!fs.existsSync(this.runtimeDir)) fs.mkdirSync(this.runtimeDir)
        if (!fs.existsSync(this.authlibDir)) fs.mkdirSync(this.authlibDir)
        if (!fs.existsSync(this.logsDir)) fs.mkdirSync(this.logsDir)
        if (!fs.existsSync(this.tempDir)) fs.mkdirSync(this.tempDir)
    }
}
