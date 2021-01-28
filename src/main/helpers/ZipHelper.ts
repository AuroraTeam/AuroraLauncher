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

import * as fs from "fs"
import * as path from "path"

import * as yauzl from "yauzl"

import { LogHelper } from "./LogHelper"
import { ProgressHelper } from "./ProgressHelper"

export class ZipHelper {
    /**
     * Распаковка архива в папку
     * @param archive - путь до архива
     * @param destDir - конечная папка
     */
    static unzipArchive(archive: string, destDir: string, whitelist: string[] = []): Promise<boolean> {
        return new Promise((resolve) => {
            yauzl.open(archive, { lazyEntries: true }, (err, zipfile) => {
                if (err) LogHelper.error(err)

                const length = zipfile.fileSize
                let downloaded = 0
                const progress = ProgressHelper.getLoadingProgressBar()

                zipfile.readEntry()
                zipfile.on("entry", (entry: yauzl.Entry) => {
                    if (/\/$/.test(entry.fileName)) {
                        if (whitelist.length == 0) fs.mkdirSync(path.resolve(destDir, entry.fileName))
                        zipfile.readEntry()
                    } else {
                        downloaded += entry.compressedSize
                        progress.emit("progress", {
                            percentage: (downloaded / length) * 100,
                        })
                        if (whitelist.length > 0 && !whitelist.includes(path.extname(entry.fileName))) {
                            zipfile.readEntry()
                        } else {
                            zipfile.openReadStream(entry, (err, readStream) => {
                                if (err) throw err
                                readStream.pipe(fs.createWriteStream(path.resolve(destDir, entry.fileName)))
                                readStream.on("end", () => {
                                    zipfile.readEntry()
                                })
                            })
                        }
                    }
                })
                zipfile.on("end", () => {
                    progress.emit("end")
                    resolve(true)
                })
                zipfile.on("error", (error) => LogHelper.error(error))
            })
        })
    }
}
