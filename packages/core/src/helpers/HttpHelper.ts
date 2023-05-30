import { mkdir, writeFile } from "fs/promises"
import { dirname } from "path"
import { URL } from "url"

import got, { Progress } from "got"
import pMap from "p-map"

import { HashHelper, JsonData, JsonHelper, StorageHelper } from "."

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
            const { statusCode } = await got.head(url)
            return statusCode >= 200 && statusCode < 300
        } catch (error) {
            return false
        }
    }

    /**
     * Чтение ресурса
     * @param url - строка или объект URL, содержащий ссылку на ресурс
     * @returns Promise, который вернёт содержимое ресурса, в случае успеха
     */
    public static async getResource(url: string | URL) {
        const { body } = await got.get(url)
        return body
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
    public static postJson<T>(url: string | URL, json: JsonData): Promise<T> {
        return got.post(url, { json }).json()
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
        }
    ) {
        if (options.saveToTempFile) filePath = StorageHelper.getTmpPath()
        if (filePath === null) throw new Error("File path not found")

        return this.download(url, filePath, options.onProgress)
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
            afterDownload?: () => void
        } = {}
    ) {
        await pMap(
            filesList,
            async (file) => {
                if (await this.verifyFileHash(file)) {
                    if (options.afterDownload) options.afterDownload()
                    return
                }

                await this.download(
                    file.sourceUrl,
                    file.destinationPath,
                    options.onProgress
                )
                if (options.afterDownload) options.afterDownload()
            },
            { concurrency: this.concurrency }
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
        onProgress?: onProgressFunction
    ): Promise<string> {
        await mkdir(dirname(filePath), { recursive: true })

        const req = got(url)

        if (onProgress) {
            req.on("downloadProgress", onProgress)
        }

        const buffer = await req.buffer()
        await writeFile(filePath, buffer)

        return filePath
    }

    private static async verifyFileHash(file: File) {
        if (!file.sha1) return false

        let currentHash
        try {
            currentHash = await HashHelper.getSHA1fromFile(file.destinationPath)
        } catch (error) {
            return false
        }

        return file.sha1 === currentHash
    }
}
