import { createWriteStream } from "fs";
import { mkdir, mkdtemp, rename, rm } from "fs/promises";
import { dirname, join } from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { URL } from "url";

import pMap from "p-map";
import { FormData, request } from "undici";

import { HashHelper, JsonData, JsonHelper, StorageHelper } from ".";

interface Progress {
    url: string | URL;
    transferred: number;
    total: number;
}
type onProgressFunction = (progress: Progress) => void;

export interface File {
    sourceUrl: string;
    destinationPath: string;
    sha1?: string;
}

export class HttpHelper {
    private static concurrency = 4;

    /**
     * Изменить количество одновременно скачиваемых файлов
     * @param concurrency
     */
    static setConcurrency(concurrency: number) {
        this.concurrency = concurrency;
    }

    /**
     * Чтение ресурса
     * @param url - строка или объект URL, содержащий ссылку на ресурс
     * @returns Promise, который вернёт содержимое ресурса, в случае успеха
     */
    static async getResource(
        url: string | URL,
        headers: Record<string, string> | null = null,
        signal?: AbortSignal,
    ) {
        const { body } = await request(url, {
            headers,
            throwOnError: true,
            signal,
        });
        return body.text();
    }

    /**
     * Получение данных из JSON ресурса
     * @param url - строка или объект URL, содержащий ссылку на ресурс
     * @returns Promise, который вернёт обработанный объект, в случае успеха
     */
    static async getResourceFromJson<T>(
        url: string | URL,
        headers?: Record<string, string>,
        signal?: AbortSignal,
    ): Promise<T> {
        return JsonHelper.parse<T>(await this.getResource(url, headers, signal));
    }

    static async post<T>(
        url: string | URL,
        body: string | Buffer | Uint8Array | Readable | null | FormData,
        headers?: Record<string, string>,
    ) {
        const { body: responseBody } = await request(url, {
            method: "POST",
            body,
            headers: { ...headers },
            throwOnError: true,
        });
        return (await responseBody.text()) as T;
    }

    /**
     * Отправка POST запроса и получение результата из JSON
     * @param url - строка или объект URL, содержащий ссылку на ресурс
     * @returns Promise, который вернёт обработанный объект, в случае успеха
     */
    static async postJson<T>(url: string | URL, json: JsonData, headers?: Record<string, string>) {
        return JsonHelper.parse<T>(
            await this.post(url, JsonHelper.stringify(json), {
                "Content-Type": "application/json",
                ...headers,
            }),
        );
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
    static downloadFile(
        url: string | URL,
        filePath: string | null,
        options: {
            onProgress?: onProgressFunction;
            saveToTempFile?: boolean;
        } = {
            saveToTempFile: false,
        },
    ) {
        if (options.saveToTempFile) filePath = StorageHelper.getTmpPath();
        if (filePath === null) throw new Error("File path not found");

        return this.download(url, filePath, options.onProgress);
    }

    /**
     * Скачивание во временный файл с последующим переименованием в оригинал
     * При передаче sha1 основной файл заменяется только после проверки хеша.
     * @param url - строка или объект URL, содержащий ссылку на файл
     * @param filePath - путь до сохраняемого файла
     * @param options - список опций:
     * @param options.onProgress - коллбэк, в который передаётся текущий прогресс загрузки, если объявлен
     * @param options.sha1 - ожидаемый SHA-1 скачанного файла
     */
    static async downloadSafeFile(
        url: string | URL,
        filePath: string,
        options: {
            onProgress?: onProgressFunction;
            sha1?: string;
        } = {},
    ) {
        if (filePath === null) throw new Error("File path not found");

        if (options.sha1 !== undefined && !/^[a-f\d]{40}$/i.test(options.sha1)) {
            throw new Error(`Invalid SHA-1 for ${url.toString()}`);
        }

        await mkdir(dirname(filePath), { recursive: true });
        const temporaryDir = await mkdtemp(join(dirname(filePath), ".download-"));
        const temporaryFile = join(temporaryDir, "file");
        try {
            await this.download(url, temporaryFile, options.onProgress);
            if (
                options.sha1 !== undefined &&
                !(await HashHelper.compareFileHash(
                    temporaryFile,
                    "sha1",
                    options.sha1.toLowerCase(),
                ))
            ) {
                throw new Error(`SHA-1 mismatch for ${url.toString()}`);
            }
            await rename(temporaryFile, filePath);
        } finally {
            await rm(temporaryDir, { recursive: true, force: true });
        }
    }

    /**
     * Скачивание файлов
     * @param filesList - список файлов
     * @param options - список опций:
     * @param options.onProgress - коллбэк, в который передаётся текущий прогресс загрузки, если объявлен
     * @param options.saveToTempFile - сохранять во временный файл, по умолчанию `false`
     */
    static async downloadFiles(
        filesList: File[],
        options: {
            onProgress?: onProgressFunction;
            beforeDownload?: (data: { url: string | URL }) => void;
            afterDownload?: (data: { url: string | URL }) => void;
        } = {},
    ) {
        await pMap(
            filesList,
            async (file) => {
                if (await this.verifyFileHash(file)) {
                    if (options.afterDownload)
                        options.afterDownload({
                            url: file.sourceUrl,
                        });
                    return;
                }

                await this.download(
                    file.sourceUrl,
                    file.destinationPath,
                    options.onProgress,
                    options.beforeDownload,
                    options.afterDownload,
                );
            },
            { concurrency: this.concurrency },
        );
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
        redirects = 0,
    ): Promise<string> {
        await mkdir(dirname(filePath), { recursive: true });

        const { statusCode, headers, body } = await request(url);

        if (statusCode >= 400) {
            body.on("error", () => {}).destroy();
            throw new Error(`Failed to download ${url.toString()} with status code ${statusCode}`);
        }

        const location = <string | undefined>headers["location"];
        // handle redirects
        if (statusCode >= 300 && statusCode < 400) {
            body.on("error", () => {}).destroy();
            if (!location || redirects >= 10) {
                throw new Error(`Invalid or excessive redirects for ${url.toString()}`);
            }
            return this.download(
                new URL(location, url),
                filePath,
                onProgress,
                beforeDownload,
                afterDownload,
                redirects + 1,
            );
        }

        if (onProgress) {
            let transferred = 0;
            const total = +(headers["content-length"] || 0);

            body.on("data", (chunk: Buffer) => {
                onProgress({
                    url,
                    transferred: (transferred += chunk.byteLength),
                    total,
                });
            });
        }

        if (beforeDownload) {
            beforeDownload({ url });
        }

        await pipeline(body, createWriteStream(filePath));
        afterDownload?.({ url });
        return filePath;
    }

    private static async verifyFileHash(file: File) {
        if (!file.sha1) return false;

        try {
            return await HashHelper.compareFileHash(file.destinationPath, "sha1", file.sha1);
        } catch {
            return false;
        }
    }
}
