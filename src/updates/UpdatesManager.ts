import * as crypto from "crypto"
import * as fs from "fs"
import * as path from "path"

import { LogHelper } from "../helpers/LogHelper"
import { StorageHelper } from "../helpers/StorageHelper"
import { App } from "../LauncherServer"

export class UpdatesManager {
    hDirs: Map<string, HashedFile[]> = new Map()

    constructor() {
        this.hashUpdatesDir()
    }

    hashUpdatesDir(): void {
        const folders = fs.readdirSync(StorageHelper.updatesDir)
        if (folders.length !== 0) {
            LogHelper.info(App.LangManager.getTranslate().UpdatesManager.sync)
            folders.forEach((el) => {
                const startTime = new Date().getTime()
                this.hDirs.set(el, this.hashDir(path.resolve(StorageHelper.updatesDir, el)))
                LogHelper.info(
                    App.LangManager.getTranslate().UpdatesManager.syncTime,
                    el,
                    new Date().getTime() - startTime
                )
            })
            LogHelper.info(App.LangManager.getTranslate().UpdatesManager.syncEnd)
        } else {
            LogHelper.info(App.LangManager.getTranslate().UpdatesManager.syncSkip)
        }
    }

    hashDir(dir: string, arrayOfFiles: HashedFile[] = []): HashedFile[] {
        const entries: string[] = fs.readdirSync(dir)
        for (const e of entries) {
            const file = path.resolve(dir, e)
            if (fs.statSync(file).isDirectory()) {
                arrayOfFiles.concat(this.hashDir(file, arrayOfFiles))
            } else {
                const hash: HashedFile = this.hashFile(file)
                arrayOfFiles.push(hash)
            }
        }
        return arrayOfFiles
    }

    hashFile(path: string): HashedFile {
        const output: HashedFile = new HashedFile()
        const dir = fs.statSync(path)
        output.path = path.replace(StorageHelper.updatesDir, "")
        output.size = dir.size
        output.hashsum = crypto.createHash("sha1").update(fs.readFileSync(path)).digest("hex")
        return output
    }

    unindexAssets(): void {
        return
    }

    indexAssets(): void {
        return
    }
}

export class HashedFile {
    path: string
    hashsum: string
    size: number
}
