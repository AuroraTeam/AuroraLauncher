import crypto from "crypto"
import fs from "fs"
import path from "path"

import { LogHelper, StorageHelper } from "@root/helpers"
import { App } from "@root/LauncherServer"

export class InstancesManager {
    hashDirs: Map<string, HashedFile[]> = new Map()

    constructor() {
        this.hashInstancesDir()
    }

    hashInstancesDir(): void {
        const folders = fs
            .readdirSync(StorageHelper.updatesDir, { withFileTypes: true })
            .filter((folder) => folder.isDirectory())

        if (folders.length === 0) return LogHelper.info(App.LangManager.getTranslate().UpdatesManager.syncSkip)

        LogHelper.info(App.LangManager.getTranslate().UpdatesManager.sync)

        folders.forEach(({ name }) => {
            const startTime = Date.now()

            this.hashDirs.set(name, this.hashDir(path.join(StorageHelper.updatesDir, name)))

            LogHelper.info(App.LangManager.getTranslate().UpdatesManager.syncTime, name, Date.now() - startTime)
        })

        LogHelper.info(App.LangManager.getTranslate().UpdatesManager.syncEnd)
    }

    hashDir(dir: string, arrayOfFiles: HashedFile[] = []): HashedFile[] {
        fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
            const file = path.join(dir, entry.name)
            if (entry.isDirectory()) {
                arrayOfFiles.concat(this.hashDir(file, arrayOfFiles))
            } else {
                arrayOfFiles.push(this.hashFile(file))
            }
        })
        return arrayOfFiles
    }

    hashFile(path: string): HashedFile {
        return {
            path: path.replace(StorageHelper.updatesDir, ""),
            size: fs.statSync(path).size,
            hashsum: crypto.createHash("sha1").update(fs.readFileSync(path)).digest("hex"),
        }
    }
}

export class HashedFile {
    path: string
    hashsum: string
    size: number
}
