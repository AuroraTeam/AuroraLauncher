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
    static unzipArchive(archive: string, destDir: string): Promise<boolean> {
        return new Promise((resolve) => {
            yauzl.open(archive, { lazyEntries: true }, (err, zipfile) => {
                if (err) LogHelper.error(err)

                const length = zipfile.fileSize
                let remaining = length
                const progress = ProgressHelper.getLoadingProgressBar()

                zipfile.readEntry()
                zipfile.on("entry", (entry: yauzl.Entry) => {
                    if (/\/$/.test(entry.fileName)) {
                        fs.mkdirSync(path.resolve(destDir, entry.fileName))
                        zipfile.readEntry()
                    } else {
                        remaining -= entry.compressedSize
                        progress.emit("progress", {
                            percentage: ((length - remaining) / length) * 100,
                        })
                        zipfile.openReadStream(entry, (err, readStream) => {
                            if (err) throw err
                            readStream.pipe(fs.createWriteStream(path.resolve(destDir, entry.fileName)))
                            readStream.on("end", () => {
                                zipfile.readEntry()
                            })
                        })
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
