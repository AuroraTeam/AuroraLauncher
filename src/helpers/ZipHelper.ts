import * as fs from "fs"
import * as path from "path"

import AdmZip from "adm-zip"

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
