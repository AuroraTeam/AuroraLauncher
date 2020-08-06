import * as crypto from "crypto"
import * as fs from "fs"
import * as path from "path"

import { LogHelper } from "./../helpers/LogHelper"
import { StorageHelper } from "../helpers/StorageHelper"

export class UpdatesManager {
    hDirs: Map<string, HDir[]> = new Map()

    constructor() {
        this.hashUpdatesDir()
    }

    hashUpdatesDir(): void {
        let folders = fs.readdirSync(StorageHelper.updatesDir)
        if (folders.length !== 0) {
            LogHelper.info("Syncing updates dir")
            let startTime = new Date().getTime()
            folders.forEach((el) => {
                this.hDirs.set(el, this.hashDir(path.resolve(StorageHelper.updatesDir, el)))
                LogHelper.info('Syncing "%s" - %dms', el, new Date().getTime() - startTime)
            })
            LogHelper.info("Syncing updates dir end")
        } else {
            LogHelper.info("Updates dir empty. Skip sync")
        }
    }

    hashDir(inDir: string, arrayOfFiles?: HDir[]): HDir[] {
        let output: HDir[] = arrayOfFiles || []
        let dir: string[] = fs.readdirSync(inDir)
        for (let p of dir) {
            let hash: HDir = this.hashFile(path.resolve(inDir, p))
            output.push(hash)
            if (hash.isDir) {
                output.concat(this.hashDir(hash.path, output))
            }
        }
        return output
    }

    hashFile(path: string): HDir {
        let output: HDir = new HDir()
        let dir = fs.statSync(path)
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

    unindexAssets(): void {}

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
