import { randomBytes } from "crypto"
import * as fs from "fs"
import * as http from "http"
import * as https from "https"
import * as path from "path"
import { URL } from "url"

import { LogHelper } from "./LogHelper"
import { ProgressHelper } from "./ProgressHelper"
import { StorageHelper } from "./StorageHelper"

export class HttpHelper {
    /**
     * Проверка наличия файла
     * @param url - Объект Url, содержащий ссылку на файл
     * @returns Promise который вернёт `true` в случае существования файла или `false` при его отсутствии или ошибке
     */
    static existFile(url: URL): Promise<boolean> {
        return new Promise((resolve) => {
            const handler = url.protocol === "https:" ? https : http
            handler
                .request(url, { method: "HEAD" }, (res) => {
                    new RegExp(/2[\d]{2}/).test(res.statusCode.toString()) ? resolve(true) : resolve(false)
                })
                .on("error", (err) => {
                    LogHelper.error(err)
                    resolve(false)
                })
                .end()
        })
    }

    /**
     * Просмотр файла
     * @param url - Ссылка на файл
     * @returns Promise который вернёт содержимое файла в случае успеха
     */
    static readFile(url: URL): Promise<string> {
        return new Promise(function (resolve, reject) {
            const handler = url.protocol === "https:" ? https : http
            handler
                .get(url, (res) => {
                    res.setEncoding("utf8")
                    let data = ""
                    res.on("data", (chunk) => {
                        data += chunk
                    })
                    res.on("end", () => {
                        resolve(data)
                    })
                })
                .on("error", (err) => {
                    reject(err)
                })
        })
    }

    /**
     * Скачивание файла
     * @param url - Объект Url, содержащий ссылку на файл
     * @param filename - путь до сохраняемого файла
     * @returns Promise который вернёт название файла в случае успеха
     */
    static downloadFile(
        url: URL,
        filename: string | null,
        options?: { showProgress?: boolean, saveToTempFile?: boolean }
    ): Promise<string> {
        options = Object.assign({ showProgress: true, saveToTempFile: false }, options)
        
        return new Promise((resolve, reject) => {
            if (options.saveToTempFile) filename = path.resolve(StorageHelper.tempDir, randomBytes(16).toString("hex"))
            if (filename === null) reject("Filename not found")

            const file = fs.createWriteStream(filename)
            file.on("close", () => {
                resolve(filename)
            })

            const handler = url.protocol === "https:" ? https : http
            handler
                .get(url, (res) => {
                    if (options.showProgress) {
                        const progress = ProgressHelper.getDownloadProgressBar()
                        progress.start(parseInt(res.headers["content-length"]) || 0, 0)
                        res.on('data', (chunk: Buffer) => {
                            progress.increment(chunk.length)
                        })
                        res.on("end", () => {
                            progress.stop()
                            process.stderr.clearLine(0)
                            process.stderr.cursorTo(0)
                        })
                    }
                    res.pipe(file)
                })
                .on("error", (err) => {
                    fs.unlinkSync(filename)
                    reject(err)
                })
        })
    }
}
