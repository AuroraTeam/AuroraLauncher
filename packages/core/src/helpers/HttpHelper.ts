import { mkdir, rename } from "fs/promises"
import { dirname } from "path"
import { URL } from "url"

import pMap from "p-map"

import { HashHelper, JsonData, JsonHelper, StorageHelper } from "."
import { createWriteStream } from "fs"
import { request } from "undici"

interface Progress {
    url: string | URL
    transferred: number
    total: number
}
type onProgressFunction = (progress: Progress) => void

export interface File {
    sourceUrl: string
    destinationPath: string
    sha1?: string
}

export class HttpHelper {
    private static concurrency = 4

    /**
     * Изменить количество одновременно скачиваемых файлов
     * @param concurrency
     */
    public static setConcurrency(concurrency: number) {
        this.concurrency = concurrency
    }

    /**
     * Проверка наличия ресурса
     * @param url - строка или объект URL, содержащий ссылку на ресурс
     * @returns Promise, который вернёт `true`, в случае существования ресурса или `false` при его отсутствии или ошибке
     */
    public static async existsResource(url: string | URL) {
        try {
            const { statusCode } = await request(url, { method: "HEAD" })
            return statusCode >= 200 && statusCode < 300
        } catch {
            return false
        }
    }

    /**
     * Чтение ресурса
     * @param url - строка или объект URL, содержащий ссылку на ресурс
     * @returns Promise, который вернёт содержимое ресурса, в случае успеха
     */
    public static async getResource(url: string | URL) {
        const { body } = await request(url)
        return body.text()
    }

    /**
     * Получение данных из JSON ресурса
     * @param url - строка или объект URL, содержащий ссылку на ресурс
     * @returns Promise, который вернёт обработанный объект, в случае успеха
     */
    public static async getResourceFromJson<T>(url: string | URL): Promise<T> {
        return JsonHelper.fromJson<T>(await this.getResource(url))
    }

    /**
     * Отправка POST запроса и получение результата из JSON
     * @param url - строка или объект URL, содержащий ссылку на ресурс
     * @returns Promise, который вернёт обработанный объект, в случае успеха
     */
    public static async postJson<T>(
        url: string | URL,
        json: JsonData,
    ): Promise<T> {
        const { body } = await request(url, {
            method: "POST",
            body: JsonHelper.toJson(json),
            headers: { "Content-Type": "application/json" },
        })
        return (await body.json()) as T
    }

    /**
     * Скачивание файла
     * @param url - строка или объект URL, содержащий ссылку на файл
     * @param filePath - путь до сохраняемого файла
     * @param options - список опций:
     * @param options.onProgress - коллбэк, в который передаётся текущий прогресс загрузки, если объявлен
     * @param options.saveToTempFile - сохранять во временный файл, по умолчанию `false`
     * @returns Promise который вернёт название файла в случае успеха
     */
    public static downloadFile(
        url: string | URL,
        filePath: string | null,
        options: {
            onProgress?: onProgressFunction
            saveToTempFile?: boolean
        } = {
            saveToTempFile: false,
        },
    ) {
        if (options.saveToTempFile) filePath = StorageHelper.getTmpPath()
        if (filePath === null) throw new Error("File path not found")

        return this.download(url, filePath, options.onProgress)
    }

    /**
     * Скачивание во временный файл с последующим переименованием в оригинал
     * @param url - строка или объект URL, содержащий ссылку на файл
     * @param filePath - путь до сохраняемого файла
     * @param options - список опций:
     * @param options.onProgress - коллбэк, в который передаётся текущий прогресс загрузки, если объявлен
     */
    public static async downloadSafeFile(
        url: string | URL,
        filePath: string,
        options: {
            onProgress?: onProgressFunction
        } = {},
    ) {
        if (filePath === null) throw new Error("File path not found")

        await this.download(url, `${filePath}.safe`, options.onProgress)
        return await rename(`${filePath}.safe`, filePath)
    }

    /**
     * Скачивание файлов
     * @param filesList - список файлов
     * @param options - список опций:
     * @param options.onProgress - коллбэк, в который передаётся текущий прогресс загрузки, если объявлен
     * @param options.saveToTempFile - сохранять во временный файл, по умолчанию `false`
     */
    public static async downloadFiles(
        filesList: File[],
        options: {
            onProgress?: onProgressFunction
            beforeDownload?: (data: { url: string | URL }) => void
            afterDownload?: (data: { url: string | URL }) => void
        } = {},
    ) {
        await pMap(
            filesList,
            async (file) => {
                if (await this.verifyFileHash(file)) {
                    if (options.afterDownload)
                        options.afterDownload({
                            url: file.sourceUrl,
                        })
                    return
                }

                await this.download(
                    file.sourceUrl,
                    file.destinationPath,
                    options.onProgress,
                    options.beforeDownload,
                    options.afterDownload,
                )
            },
            { concurrency: this.concurrency },
        )
    }

    /**
     * Внутренняя функция скачивания файла
     * @param url - строка или объект URL, содержащий ссылку на файл
     * @param filePath - путь до сохраняемого файла
     * @param onProgress - коллбэк, в который передаётся текущий прогресс загрузки, если объявлен
     * @returns Promise, который вернёт название файла, в случае успеха
     */
    private static async download(
        url: string | URL,
        filePath: string,
        onProgress?: onProgressFunction,
        beforeDownload?: (data: { url: string | URL }) => void,
        afterDownload?: (data: { url: string | URL }) => void,
    ): Promise<string> {
        await mkdir(dirname(filePath), { recursive: true })

        const { statusCode, headers, body } = await request(url)

        if (statusCode >= 400) {
            throw new Error(
                `Failed to download ${url} with status code ${statusCode}`,
            )
        }

        const location = <string | undefined>headers["location"]
        // handle redirects
        if (statusCode > 300 && statusCode < 400 && !!location) {
            return this.download(
                location,
                filePath,
                onProgress,
                beforeDownload,
                afterDownload,
            )
        }

        if (onProgress) {
            let transferred = 0
            const total = +(headers["content-length"] || 0)

            body.on("data", (chunk) => {
                onProgress({
                    url,
                    transferred: (transferred += chunk.byteLength),
                    total,
                })
            })
        }

        if (beforeDownload) {
            beforeDownload({ url })
        }

        return new Promise((resolve, reject) => {
            body.pipe(createWriteStream(filePath))
                .on("finish", () => {
                    resolve(filePath)
                    if (afterDownload) {
                        afterDownload({ url })
                    }
                })
                .on("error", (error) => reject(error))
        })
    }

    private static async verifyFileHash(file: File) {
        if (!file.sha1) return false

        try {
            return await HashHelper.compareFileHash(
                file.destinationPath,
                "sha1",
                file.sha1,
            )
        } catch {
            return false
        }
    }
}
