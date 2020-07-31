import * as fs from "fs"
import * as path from "path"

import { LogHelper } from "./LogHelper"

export class StorageHelper {
    static storageDir: string = __dirname
    static updatesDir: string = path.resolve(StorageHelper.storageDir, "updates")
    static profilesDir: string = path.resolve(StorageHelper.storageDir, "profiles")
    static modulesDir: string = path.resolve(StorageHelper.storageDir, "modules")
    static logsDir: string = path.resolve(StorageHelper.storageDir, "logs")
    static tempDir: string = path.resolve(StorageHelper.storageDir, "temp")
    static configFile: string = path.resolve(StorageHelper.storageDir, "LauncherServerConfig.json")

    static createMissing(): void {
        if (!fs.existsSync(this.updatesDir)) fs.mkdirSync(this.updatesDir)
        if (!fs.existsSync(this.profilesDir)) fs.mkdirSync(this.profilesDir)
        if (!fs.existsSync(this.modulesDir)) fs.mkdirSync(this.modulesDir)
        if (!fs.existsSync(this.logsDir)) fs.mkdirSync(this.logsDir)
        if (!fs.existsSync(this.tempDir)) fs.mkdirSync(this.tempDir)
    }
}
