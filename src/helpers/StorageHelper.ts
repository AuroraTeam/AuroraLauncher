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
