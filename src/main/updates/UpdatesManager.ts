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
    hDirs: Map<string, HashedFile[]> = new Map()

    constructor() {
        this.hashUpdatesDir()
    }

    hashUpdatesDir(): void {
        const folders = fs.readdirSync(StorageHelper.updatesDir)
        if (folders.length !== 0) {
            LogHelper.info(App.LangManager.getTranslate("UpdatesManager.sync"))
            folders.forEach((el) => {
                // async?
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
