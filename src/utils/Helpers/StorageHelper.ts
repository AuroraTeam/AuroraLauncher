import { existsSync, mkdirSync } from "fs"
import { dirname, resolve } from "path"

import { StorageHelper as CoreStorageHelper } from "@auroralauncher/core"

import { SystemHelper } from "./SystemHelper"

export class StorageHelper extends CoreStorageHelper {
    /* Folders */
    static readonly storageDir: string = SystemHelper.isStandalone()
        ? dirname(process.execPath)
        : __dirname
    static readonly filesDir: string = resolve(this.storageDir, "files")
    static readonly assetsDir: string = resolve(this.filesDir, "assets")
    static readonly librariesDir: string = resolve(this.filesDir, "libraries")
    static readonly instancesDir: string = resolve(this.filesDir, "instances")
    static readonly profilesDir: string = resolve(this.storageDir, "profiles")
    static readonly modulesDir: string = resolve(this.storageDir, "modules")
    // static readonly runtimeDir: string = resolve(this.storageDir, "runtime") // TODO auto download
    static readonly authlibDir: string = resolve(this.storageDir, "authlib")
    static readonly logsDir: string = resolve(this.storageDir, "logs")

    /* Files */
    static readonly configFile: string = resolve(
        this.storageDir,
        "LauncherServerConfig.json"
    )

    static validate(): void {
        if (!existsSync(this.filesDir)) mkdirSync(this.filesDir)
        if (!existsSync(this.assetsDir)) mkdirSync(this.assetsDir)
        if (!existsSync(this.librariesDir)) mkdirSync(this.librariesDir)
        if (!existsSync(this.instancesDir)) mkdirSync(this.instancesDir)
        if (!existsSync(this.profilesDir)) mkdirSync(this.profilesDir)
        if (!existsSync(this.modulesDir)) mkdirSync(this.modulesDir)
        if (!existsSync(this.authlibDir)) mkdirSync(this.authlibDir)
        if (!existsSync(this.logsDir)) mkdirSync(this.logsDir)
    }
}
