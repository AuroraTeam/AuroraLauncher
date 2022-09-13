import fs from "fs"
import path from "path"

import { StorageHelper as CoreStorageHelper } from "@auroralauncher/core"

import { SystemHelper } from "./SystemHelper"

export class StorageHelper extends CoreStorageHelper {
    static readonly storageDir: string = SystemHelper.isStandalone() ? path.dirname(process.execPath) : __dirname
    static readonly instancesDir: string = path.resolve(StorageHelper.storageDir, "updates")
    static readonly profilesDir: string = path.resolve(StorageHelper.storageDir, "profiles")
    static readonly modulesDir: string = path.resolve(StorageHelper.storageDir, "modules")
    // static readonly runtimeDir: string = path.resolve(StorageHelper.storageDir, "runtime") // TODO auto download
    static readonly authlibDir: string = path.resolve(StorageHelper.storageDir, "authlib")
    static readonly tempDir: string = path.resolve(StorageHelper.storageDir, "temp")
    static readonly configFile: string = path.resolve(StorageHelper.storageDir, "LauncherServerConfig.json")
    static readonly logsDir: string = path.resolve(StorageHelper.storageDir, "logs")

    static createMissing(): void {
        if (!fs.existsSync(this.logsDir)) fs.mkdirSync(this.logsDir)
        if (!fs.existsSync(this.instancesDir)) fs.mkdirSync(this.instancesDir)
        if (!fs.existsSync(this.profilesDir)) fs.mkdirSync(this.profilesDir)
        if (!fs.existsSync(this.modulesDir)) fs.mkdirSync(this.modulesDir)
        // if (!fs.existsSync(this.runtimeDir)) fs.mkdirSync(this.runtimeDir)
        if (!fs.existsSync(this.authlibDir)) fs.mkdirSync(this.authlibDir)
        if (!fs.existsSync(this.tempDir)) fs.mkdirSync(this.tempDir)
    }
}
