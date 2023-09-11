import { extname } from "path"

import AdmZip from "adm-zip"

export class ZipHelper {
    /**
     * Распаковка архива в папку
     * @param archive - путь до архива
     * @param destDir - конечная папка
     * @param whitelist
     * @param onProgress
     */
    static unzip(
        archive: string,
        destDir: string,
        whitelist: string[] = [],
        onProgress?: (size: number) => void,
    ): void {
        const zip = new AdmZip(archive)

        zip.getEntries().forEach((entry) => {
            if (
                entry.isDirectory ||
                (whitelist.length > 0 &&
                    !whitelist.includes(extname(entry.entryName)))
            )
                return

            onProgress && onProgress(entry.header.compressedSize)
            zip.extractEntryTo(entry, destDir, true, true)
        })
    }
}
