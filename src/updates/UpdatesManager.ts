import * as crypto from "crypto"
import * as fs from "fs"
import * as path from "path"

import { LogHelper } from "../helpers/LogHelper"
import { StorageHelper } from "../helpers/StorageHelper"
import { App } from "../LauncherServer"

// Я чёт подумал и решил оставить тут синхронный код, так надо)
export class UpdatesManager {
    hDirs: Map<string, HashedFile[]> = new Map()

    constructor() {
        this.hashUpdatesDir()
    }

    hashUpdatesDir(): void {
        const folders = fs.readdirSync(StorageHelper.updatesDir)
        if (folders.length === 0) return LogHelper.info(App.LangManager.getTranslate().UpdatesManager.syncSkip)

        LogHelper.info(App.LangManager.getTranslate().UpdatesManager.sync)
        folders.forEach((el) => {
            const startTime = new Date().getTime()
            this.hDirs.set(el, this.hashDir(path.resolve(StorageHelper.updatesDir, el)))
            LogHelper.info(App.LangManager.getTranslate().UpdatesManager.syncTime, el, new Date().getTime() - startTime)
        })
        LogHelper.info(App.LangManager.getTranslate().UpdatesManager.syncEnd)
    }

    hashDir(dir: string, arrayOfFiles: HashedFile[] = []): HashedFile[] {
        const entries = fs.readdirSync(dir, { withFileTypes: true })
        for (const entry of entries) {
            const file = path.resolve(dir, entry.name)
            if (entry.isDirectory()) {
                arrayOfFiles.concat(this.hashDir(file, arrayOfFiles))
            } else {
                arrayOfFiles.push(this.hashFile(file))
            }
        }
        return arrayOfFiles
    }

    hashFile(path: string): HashedFile {
        const dir = fs.statSync(path)
        return {
            path: path.replace(StorageHelper.updatesDir, ""),
            size: dir.size,
            hashsum: fs.createReadStream(path).pipe(crypto.createHash("sha1")).digest("hex"),
        }
    }
}

export class HashedFile {
    path: string
    hashsum: string
    size: number
}
