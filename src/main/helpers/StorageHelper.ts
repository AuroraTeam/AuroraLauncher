import path = require("path")
import fs = require("fs")

export class StorageHelper {
    static storageDir: string = path.resolve(__dirname, "..", "..", "storage")
    static updatesDir: string = path.resolve(StorageHelper.storageDir, "updates")
    static profilesDir: string = path.resolve(StorageHelper.storageDir, "profiles")
    static modulesDir: string = path.resolve(StorageHelper.storageDir, "modules")
    static configFile: string = path.resolve(StorageHelper.storageDir, "Server.js")

    static createMissing(): void {
        if (!fs.existsSync(StorageHelper.storageDir)) fs.mkdirSync(StorageHelper.storageDir)
        if (!fs.existsSync(StorageHelper.updatesDir)) fs.mkdirSync(StorageHelper.updatesDir)
        if (!fs.existsSync(StorageHelper.profilesDir)) fs.mkdirSync(StorageHelper.profilesDir)
        if (!fs.existsSync(StorageHelper.modulesDir)) fs.mkdirSync(StorageHelper.modulesDir)
    }
}