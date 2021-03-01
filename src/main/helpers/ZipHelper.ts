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

import * as AdmZip from "adm-zip"

import { ProgressHelper } from "./ProgressHelper"

export class ZipHelper {
    /**
     * Распаковка архива в папку
     * @param archive - путь до архива
     * @param destDir - конечная папка
     */
    static unzipArchive(archive: string, destDir: string, whitelist: string[] = []): void {
        const zipfile = new AdmZip(archive)
        const stat = fs.statSync(archive)
        const progress = ProgressHelper.getLoadingProgressBar()
        progress.start(stat.size, 0)

        zipfile.getEntries().forEach((entry) => {
            if (entry.isDirectory) return
            if (whitelist.length > 0 && !whitelist.includes(path.extname(entry.entryName))) return

            progress.increment((entry.header as any).compressedSize)
            zipfile.extractEntryTo(entry, destDir)
        })
        progress.stop()
    }
}
