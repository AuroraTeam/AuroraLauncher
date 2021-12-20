import { randomBytes } from "crypto"
import * as fs from "fs"
import * as http from "http"
import * as https from "https"
import * as path from "path"
import { URL } from "url"

import { SingleBar } from "cli-progress"
import pMap from "p-map"
import getRawBody from "raw-body"

import { JsonHelper } from "./JsonHelper"
import { LogHelper } from "./LogHelper"
import { ProgressHelper } from "./ProgressHelper"
import { StorageHelper } from "./StorageHelper"

export class HttpHelper {
    /**
     * makeRequest
     */
    public static makePostRequest(url: URL, data: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const handler = url.protocol === "https:" ? https : http

            let resDate = ""

            const req = handler.request(
                url,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Content-Length": Buffer.byteLength(data),
                    },
                },
                (res) => {
                    res.on("data", (chunk) => {
                        resDate += chunk
                    })
                    res.on("end", () => {
                        resolve(JSON.parse(resDate))
                    })
                }
            )

            req.on("error", (e) => {
                reject(e.message)
            })

            req.write(data)
            req.end()
        })
    }

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
                    res.statusCode === 200 ? resolve(true) : resolve(false)
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
     * @param filePath - путь до сохраняемого файла
     * @param options - список опций:
     * @param options.showProgress - показывать прогресс бар, по умолчанию `true`
     * @param options.saveToTempFile - сохранять во временный файл, по умолчанию `false`
     * @returns Promise который вернёт название файла в случае успеха
     */
    public static async downloadFile(
        url: URL,
        filePath: string | null,
        options?: { showProgress?: boolean; saveToTempFile?: boolean }
    ): Promise<string> {
        options = Object.assign({ showProgress: true, saveToTempFile: false }, options)

        if (options.saveToTempFile) filePath = path.resolve(StorageHelper.tempDir, randomBytes(16).toString("hex"))
        if (filePath === null) return Promise.reject("File path not found")

        return await this.download(
            url,
            filePath,
            options.showProgress ? ProgressHelper.getDownloadProgressBar() : undefined
        )
    }

    /**
     * Скачивание файлов
     * @param url - итерируемый объект, содержащий ссылки на файлы (без домена)
     * @param site - домен сайта, с которого будут качаться файлы
     * @param dirname - папка в которую будут сохранены все файлы
     */
    public static async downloadFiles(
        urls: Iterable<string>,
        site: string,
        dirname: string,
        callback?: (filePath: string) => void
    ): Promise<void> {
        const multiProgress = ProgressHelper.getDownloadMultiProgressBar()
        await pMap(
            urls,
            async (filename) => {
                const filePath = path.resolve(dirname, filename)
                fs.mkdirSync(path.dirname(filePath), { recursive: true })

                const progress = multiProgress.create(0, 0)
                await this.download(new URL(filename, site), filePath, progress)
                multiProgress.remove(progress)
                if (callback) callback(filePath)
            },
            {
                concurrency: 4,
            }
        )
        multiProgress.stop() // Лучше закрывать ручками, ибо не успевает обработаться таймаут и появляется лишняя строка
    }

    /**
     * Внутренняя функция скачивания файла
     * @param url - объект URL, содержащий ссылку на файл
     * @param filePath - путь до сохраняемого файла
     * @param progressBar - объект прогресс бара, если нужно отрисовывать прогресс скачивания
     * @returns Promise, который вернёт название файла, в случае успеха
     */
    private static download(url: URL, filePath: string, progressBar?: SingleBar): Promise<string> {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(filePath)
            file.on("close", () => {
                resolve(filePath)
            })

            const handler = url.protocol === "https:" ? https : http
            handler
                .get(url, (res) => {
                    if (progressBar !== undefined) {
                        progressBar.start(parseInt(res.headers["content-length"]) || 0, 0, {
                            filename: path.basename(filePath),
                        })
                        res.on("data", (chunk: Buffer) => {
                            progressBar.increment(chunk.length)
                        })
                    }
                    res.pipe(file)
                })
                .on("error", (err) => {
                    fs.unlinkSync(filePath)
                    reject(err)
                })
        })
    }

    // TODO Проработать этот момент
    public static isEmptyQuery(query: URLSearchParams): boolean {
        return query.toString().length === 0
    }

    public static parseQuery(url: string): URLSearchParams {
        return new URLSearchParams(url.split("?")[1])
    }

    public static sendError(res: http.ServerResponse, code = 400, error?: string, errorMessage?: string): void {
        res.statusCode = code
        this.sendJson(res, { error, errorMessage })
    }

    public static sendJson(res: http.ServerResponse, data: object): void {
        res.setHeader("Content-Type", "application/json; charset=utf-8")
        res.end(JsonHelper.toJSON(data))
    }

    public static isJsonPostData(req: http.IncomingMessage): boolean {
        return !!req.headers["content-type"] || req.headers["content-type"].includes("application/json")
    }

    /**
     * @returns Объект в случае успеха, иначе ошибку парсинга функции getRawBody
     * @throws Выбрасывает объект ошибки в случае ошибки парсинга
     */
    public static async parsePostData(req: http.IncomingMessage): Promise<string> {
        return await getRawBody(req, { limit: "500kb", encoding: "utf-8" })
    }
}
