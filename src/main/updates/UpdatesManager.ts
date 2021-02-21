/**
 * AuroraLauncher LauncherServer - Server for AuroraLauncher
 * Copyright (C) 2020 - 2021 AuroraTeam

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import * as crypto from "crypto"
import * as fs from "fs"
import * as path from "path"

import { LogHelper } from "../helpers/LogHelper"
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
            folders.forEach((el) => {
                const startTime = new Date().getTime()
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

    hashDir(inDir: string, arrayOfFiles: HDir[] = []): HDir[] {
        const dir: string[] = fs.readdirSync(inDir)
        for (const p of dir) {
            const hash: HDir = this.hashFile(path.resolve(inDir, p))
            arrayOfFiles.push(hash)
            if (hash.isDir) {
                arrayOfFiles.concat(this.hashDir(hash.path, arrayOfFiles))
            }
        }
        return arrayOfFiles
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

    unindexAssets(): void {
        return
    }

    indexAssets(): void {
        return
    }
}

// TODO HFile?
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
