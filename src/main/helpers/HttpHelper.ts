import { randomBytes } from "crypto"
import * as fs from "fs"
import * as http from "http"
import * as https from "https"
import * as path from "path"
import { URL } from "url"

import { LogHelper } from "../helpers/LogHelper"
import { ProgressHelper } from "../helpers/ProgressHelper"
import { StorageHelper } from "../helpers/StorageHelper"

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
     * @param showProgress - отображать прогресс бар или нет, по умолчанию `true`
     * @returns Promise который вернёт название временного файла в случае успеха
     */
    static downloadFile(url: URL, showProgress = true): Promise<string> {
        return new Promise((resolve, reject) => {
            const handler = url.protocol === "https:" ? https : http
            const tempFilename = path.resolve(StorageHelper.tempDir, randomBytes(16).toString("hex"))
            const tempFile = fs.createWriteStream(tempFilename)
            tempFile.on("close", () => {
                resolve(tempFilename)
            })

            handler
                .get(url, (res) => {
                    if (showProgress) {
                        res.pipe(
                            ProgressHelper.getDownloadProgressBar({
                                length: parseInt(res.headers["content-length"], 10),
                            })
                        ).pipe(tempFile)
                    } else {
                        res.pipe(tempFile)
                    }
                })
                .on("error", (err) => {
                    fs.unlinkSync(tempFilename)
                    reject(err)
                })
        })
    }
}