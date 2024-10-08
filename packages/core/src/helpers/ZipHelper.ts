import { extname } from "path"

import AdmZip from "adm-zip"

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
        const extractedFiles: string[] = []

        zip.getEntries().forEach((entry) => {
            if (
                entry.isDirectory ||
                (whitelist.length > 0 &&
                    !whitelist.includes(extname(entry.entryName)))
            )
                return

            onProgress && onProgress(entry.header.compressedSize)
            extractedFiles.push(entry.entryName)
            zip.extractEntryTo(entry, destDir, true, true)
        })

        return extractedFiles
    }
}
