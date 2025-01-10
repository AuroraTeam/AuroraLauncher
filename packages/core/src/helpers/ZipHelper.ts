import { extname } from "path"

import AdmZip from "adm-zip"
import { HashHelper } from "./HashHelper"

export class ZipHelper {
    /**
     * Распаковка архива в папку
     * @param archive - путь до архива
     * @param destDir - конечная папка
     * @param whitelist - распаковать файлы с определённым расширением (указывать с точкой, например: .so)
     * @param onProgress - функция для отслеживания прогресса распаковки
     * @returns список распакованных файлов
     */
    static unzip(
        archive: string,
        destDir: string,
        whitelist: string[] = [],
        onProgress?: (size: number) => void,
    ) {
        const zip = new AdmZip(archive)
        const extractedFiles: { path: string; sha1: string }[] = []

        zip.getEntries().forEach((entry) => {
            if (
                entry.isDirectory ||
                (whitelist.length > 0 &&
                    !whitelist.includes(extname(entry.entryName)))
            )
                return

            onProgress && onProgress(entry.header.compressedSize)
            const sha1 = HashHelper.getHash(entry.getData(), "sha1")
            extractedFiles.push({
                path: entry.entryName,
                sha1,
            })
            zip.extractEntryTo(entry, destDir, true, true)
        })

        return extractedFiles
    }
}
