import * as crypto from "crypto"
import * as fs from "fs"
import * as path from "path"

import { LogHelper } from "./../helpers/LogHelper"
import { StorageHelper } from "../helpers/StorageHelper"
import { App } from "../LauncherServer"

export class UpdatesManager {
    hDirs: Map<string, HDir[]> = new Map()

    constructor() {
        this.hashUpdatesDir()
    }

    hashUpdatesDir(): void {
        const folders = fs.readdirSync(StorageHelper.updatesDir)
        if (folders.length !== 0) {
            LogHelper.info(App.LangManager.getTranslate("UpdatesManager.sync"))
            const startTime = new Date().getTime()
            folders.forEach((el) => {
                this.hDirs.set(el, this.hashDir(path.resolve(StorageHelper.updatesDir, el)))
                LogHelper.info(
                    App.LangManager.getTranslate("UpdatesManager.syncTime"),
                    el,
                    new Date().getTime() - startTime
                )
            })
            LogHelper.info(App.LangManager.getTranslate("UpdatesManager.syncEnd"))
        } else {
            LogHelper.info(App.LangManager.getTranslate("UpdatesManager.syncSkip"))
        }
    }

    hashDir(inDir: string, arrayOfFiles?: HDir[]): HDir[] {
        const output: HDir[] = arrayOfFiles || []
        const dir: string[] = fs.readdirSync(inDir)
        for (const p of dir) {
            const hash: HDir = this.hashFile(path.resolve(inDir, p))
            output.push(hash)
            if (hash.isDir) {
                output.concat(this.hashDir(hash.path, output))
            }
        }
        return output
    }

    hashFile(path: string): HDir {
        const output: HDir = new HDir()
        const dir = fs.statSync(path)
        output.path = path
        if (dir.isDirectory()) {
            output.isDir = true
        } else {
            output.isDir = false
            output.size = dir.size.toString()
            output.hashsum = crypto.createHash("sha1").update(fs.readFileSync(path)).digest("hex")
        }
        return output
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    unindexAssets(): void {}

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    indexAssets(): void {}
}

export class HDir {
    path: string
    isDir: boolean
    hashsum?: string
    size?: string
}

export class digestDir {
    child: digestDir[] | digestFile[]
    name: string
}

export class digestFile {
    name: string
    hashsum: string
    size: number
}
