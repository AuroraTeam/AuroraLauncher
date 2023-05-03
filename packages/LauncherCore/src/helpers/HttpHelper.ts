import { createWriteStream } from "fs"
import { mkdir, rm } from "fs/promises"
import { dirname, resolve } from "path"
import { URL } from "url"

import got, { Progress } from "got"
import pMap from "p-map"

import { JsonData, JsonHelper, StorageHelper } from "."

type onProgressFunction = (progress: Progress) => void

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
        options?: { onProgress?: onProgressFunction; saveToTempFile?: boolean }
    ) {
        options = { saveToTempFile: false, ...options }

        if (options.saveToTempFile) filePath = StorageHelper.getTmpPath()
        if (filePath === null) throw new Error("File path not found")

        return this.download(url, filePath, options.onProgress)
    }

    /**
     * Скачивание файлов
     * @param urls - итерируемый объект, содержащий ссылки на файлы (без домена)
     * @param site - домен сайта, с которого будут качаться файлы
     * @param dirName - папка в которую будут сохранены все файлы
     */
    public static async downloadFiles(
        urls: Iterable<string>,
        site: string,
        dirName: string,
        // TODO options?
        callback?: (filePath: string) => void,
        onProgress?: onProgressFunction
    ) {
        await pMap(
            urls,
            async (fileName) => {
                const filePath = resolve(dirName, fileName)
                await mkdir(dirname(filePath), { recursive: true })

                await this.download(
                    new URL(fileName, site),
                    filePath,
                    onProgress
                )
                if (callback) callback(filePath)
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
    private static download(
        url: string | URL,
        filePath: string,
        onProgress?: onProgressFunction
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            const fileStream = got.stream(url, { throwHttpErrors: false })

            if (onProgress !== undefined) {
                fileStream.on("data", () =>
                    onProgress(fileStream.downloadProgress)
                )
            }

            fileStream.once("error", async (err) => {
                await rm(filePath)
                reject(err)
            })

            const file = createWriteStream(filePath)
            fileStream.pipe(file)

            file.once("close", () => resolve(filePath))
        })
    }
}
