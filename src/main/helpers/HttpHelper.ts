import { randomBytes } from "crypto"
import * as fs from "fs"
import * as http from "http"
import * as https from "https"
import * as path from "path"
import { URL } from "url"

import { SingleBar } from "cli-progress"
import * as pMap from "p-map"

import { LogHelper } from "./LogHelper"
import { ProgressHelper } from "./ProgressHelper"
import { StorageHelper } from "./StorageHelper"

export class HttpHelper {
    /**
     * Проверка наличия файла
     * @param url - объект Url, содержащий ссылку на файл
     * @returns Promise, который вернёт `true`, в случае существования файла или `false` при его отсутствии или ошибке
     */
    public static existFile(url: URL): Promise<boolean> {
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
     * @param url - ссылка на файл
     * @returns Promise, который вернёт содержимое файла, в случае успеха
     */
    public static readFile(url: URL): Promise<string> {
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
     * @param url - объект URL, содержащий ссылку на файл
     * @param filename - путь до сохраняемого файла
     * @param options - список опций:
     * @param options.showProgress - показывать прогресс бар, по умолчанию `true`
     * @param options.saveToTempFile - сохранять во временный файл, по умолчанию `false`
     * @returns Promise который вернёт название файла в случае успеха
     */
    public static async downloadFile(
        url: URL,
        filename: string | null,
        options?: { showProgress?: boolean; saveToTempFile?: boolean }
    ): Promise<string> {
        options = Object.assign({ showProgress: true, saveToTempFile: false }, options)

        if (options.saveToTempFile) filename = path.resolve(StorageHelper.tempDir, randomBytes(16).toString("hex"))
        if (filename === null) return Promise.reject("Filename not found")

        return await this.download(
            url,
            filename,
            options.showProgress ? ProgressHelper.getDownloadProgressBar() : undefined
        )
    }

    /**
     * Скачивание файлов
     * @param url - итерируемый объект, содержащий ссылки на файлы (без домена)
     * @param site - домен сайта, с которого будут качаться файлы
     * @param dirname - папка в которую будут сохранены все файлы
     */
    public static async downloadFiles(urls: Iterable<string>, site: string, dirname: string): Promise<void> {
        const multiProgress = ProgressHelper.getDownloadMultiProgressBar()
        await pMap(
            urls,
            async (filename) => {
                const filePath = path.resolve(dirname, filename)
                fs.mkdirSync(path.dirname(filePath), { recursive: true })

                const progress = multiProgress.create(0, 0)
                await this.download(new URL(filename, site), filePath, progress)
                multiProgress.remove(progress)
            },
            {
                concurrency: 4,
            }
        )
    }

    /**
     * Внутренняя функция скачивания файла
     * @param url - объект URL, содержащий ссылку на файл
     * @param filename - путь до сохраняемого файла
     * @param progressBar - объект прогресс бара, если нужно отрисовывать прогресс скачивания
     * @returns Promise, который вернёт название файла, в случае успеха
     */
    private static download(url: URL, filename: string, progressBar?: SingleBar): Promise<string> {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(filename)
            file.on("close", () => {
                resolve(filename)
            })

            const handler = url.protocol === "https:" ? https : http
            handler
                .get(url, (res) => {
                    if (progressBar !== undefined) {
                        progressBar.start(parseInt(res.headers["content-length"]) || 0, 0)
                        res.on("data", (chunk: Buffer) => {
                            progressBar.increment(chunk.length)
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
