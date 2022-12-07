import { statSync } from "fs"
import { extname } from "path"

import AdmZip from "adm-zip"

import { ProgressHelper } from "./ProgressHelper"

export class ZipHelper {
    /**
     * Распаковка архива в папку
     * @param archive - путь до архива
     * @param destDir - конечная папка
     * @param whitelist
     */
    static unzipArchive(
        archive: string,
        destDir: string,
        whitelist: string[] = []
    ): void {
        const zip = new AdmZip(archive)
        const stat = statSync(archive)
        const progress = ProgressHelper.getLoadingProgressBar()
        progress.start(stat.size, 0)

        zip.getEntries().forEach((entry) => {
            if (
                entry.isDirectory ||
                (whitelist.length > 0 &&
                    !whitelist.includes(extname(entry.entryName)))
            )
                return

            progress.increment(entry.header.compressedSize)
            zip.extractEntryTo(entry, destDir)
        })
        progress.stop()
    }
}
