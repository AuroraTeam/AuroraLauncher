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
            folders.forEach(async (el) => {
                this.hDirs.set(el, await this.hashDir(path.resolve(StorageHelper.updatesDir, el)))
                LogHelper.info('Syncing "%s" - %dms', el, new Date().getTime() - startTime)
            })
            LogHelper.info("Syncing updates dir end")
        } else {
            LogHelper.info("Updates dir empty. Skip sync")
        }
    }

    async hashDir(inDir: string, arrayOfFiles?: HDir[]): Promise<HDir[]> {
        let output: HDir[] = arrayOfFiles || []
        let dir: string[] = fs.readdirSync(inDir)
        await Promise.all(
            dir.map(async (p) => {
                let hash: HDir = this.hashFile(path.resolve(inDir, p))
                output.push(hash)
                if (hash.isDir) {
                    output.concat(await this.hashDir(hash.path, output))
                }
            })
        )
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

    unpackAssets(): void {}

    packAssets(): void {}
}

export class HDir {
    path: string
    isDir: boolean
    hashsum?: string
    size?: string
}
