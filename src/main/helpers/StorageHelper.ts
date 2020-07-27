import * as path from "path"
import * as fs from "fs"

export class StorageHelper {
    static storageDir: string = path.resolve(__dirname, "..", "..", "storage")
    static updatesDir: string = path.resolve(StorageHelper.storageDir, "updates")
    static profilesDir: string = path.resolve(StorageHelper.storageDir, "profiles")
    static modulesDir: string = path.resolve(StorageHelper.storageDir, "modules")
    static configFile: string = path.resolve(StorageHelper.storageDir, "LauncherServerConfig.json")

    static createMissing(): void {
        if (!fs.existsSync(this.storageDir)) fs.mkdirSync(this.storageDir)
        if (!fs.existsSync(this.updatesDir)) fs.mkdirSync(this.updatesDir)
        if (!fs.existsSync(this.profilesDir)) fs.mkdirSync(this.profilesDir)
        if (!fs.existsSync(this.modulesDir)) fs.mkdirSync(this.modulesDir)
    }
}
