import { randomBytes } from "crypto"
import * as fs from "fs"
import * as http from "http"
import * as https from "https"
import * as path from "path"
import { URL } from "url"

import * as rimraf from "rimraf"

import { LogHelper } from "../helpers/LogHelper"
import { ProgressHelper } from "../helpers/ProgressHelper"
import { StorageHelper } from "../helpers/StorageHelper"
import { ZipHelper } from "../helpers/ZipHelper"
import { App } from "../LauncherServer"

// TODO Реализовать работу с http2
// TODO dev logs

export class MirrorManager {
    /**
     * Скачивание клиена с зеркала
     * @param clientName - Название архива с файлами клиента
     * @param dirName - Название конечной папки
     */
    async downloadClient(clientName: string, dirName: string) {
        const mirrors: string[] = App.getConfigManager().getProperty("updatesUrl")
        const clientDir = path.resolve(StorageHelper.updatesDir, dirName)
        if (fs.existsSync(clientDir)) return LogHelper.error("Папка с таким названием уже существует!")
        const existClients: Map<number, string> = new Map()

        App.getCommandsManager().console.pause()
        await Promise.all(
            // async mirror check
            mirrors.map(async (mirror, i) => {
                if (
                    (await this.existFile(new URL(`/clients/${clientName}.json`, mirror))) &&
                    (await this.existFile(new URL(`/clients/${clientName}.zip`, mirror)))
                )
                    existClients.set(i, mirror)
            })
        )

        if (existClients.size == 0) {
            LogHelper.error(`Клиент не найден!`)
            App.getCommandsManager().console.resume()
            return
        }

        const mirror = existClients.values().next().value
        let profile: string
        let client: string

        try {
            LogHelper.info("Клиент найден, загрузка...")
            profile = await this.downloadFile(new URL(`/clients/${clientName}.json`, mirror))
            client = await this.downloadFile(new URL(`/clients/${clientName}.zip`, mirror))
        } catch (error) {
            LogHelper.error("Ошибка при загрузке клиента!")
            LogHelper.debug(error)
            App.getCommandsManager().console.resume()
            return
        }

        fs.copyFileSync(profile.toString(), path.resolve(StorageHelper.profilesDir, `${dirName}.json`))
        try {
            fs.mkdirSync(clientDir)
            LogHelper.info("Клиент загружен, распаковка...")
            await ZipHelper.unzipArchive(client.toString(), clientDir)
        } catch (error) {
            fs.rmdirSync(clientDir)
            LogHelper.error("Ошибка при распаковке клиента!")
            LogHelper.debug(error)
            App.getCommandsManager().console.resume()
            return
        } finally {
            rimraf(path.resolve(StorageHelper.tempDir, "*"), () => {})
        }

        LogHelper.info("Клиент успешно загружен!")
        App.getCommandsManager().console.resume()
    }

    /**
     * Скачивание ассетов с зеркала
     * @param assetsName - Название архива с файлами ассетов
     * @param dirName - Название конечной папки
     */
    async downloadAssets(assetsName: string, dirName: string) {
        const mirrors: string[] = App.getConfigManager().getProperty("updatesUrl")
        const assetsDir = path.resolve(StorageHelper.updatesDir, dirName)
        if (fs.existsSync(assetsDir)) return LogHelper.error("Папка с таким названием уже существует!")
        const existAssets: Map<number, string> = new Map()

        App.getCommandsManager().console.pause()
        await Promise.all(
            mirrors.map(async (mirror, i) => {
                if (await this.existFile(new URL(`/assets/${assetsName}.zip`, mirror))) existAssets.set(i, mirror)
            })
        )

        if (existAssets.size == 0) {
            LogHelper.error(`Ассеты не найдены!`)
            App.getCommandsManager().console.resume()
            return
        }

        const mirror = existAssets.values().next().value
        let assets: string

        try {
            LogHelper.info("Ассеты найдены, загрузка...")
            assets = await this.downloadFile(new URL(`/assets/${assetsName}.zip`, mirror))
        } catch (error) {
            LogHelper.error("Ошибка при загрузке ассетов!")
            LogHelper.debug(error)
            App.getCommandsManager().console.resume()
            return
        }

        try {
            fs.mkdirSync(assetsDir)
            LogHelper.info("Ассеты загружены, распаковка...")
            await ZipHelper.unzipArchive(assets.toString(), assetsDir)
        } catch (error) {
            fs.rmdirSync(assetsDir)
            LogHelper.error("Ошибка при распаковке ассетов!")
            LogHelper.debug(error)
            App.getCommandsManager().console.resume()
            return
        } finally {
            rimraf(path.resolve(StorageHelper.tempDir, "*"), () => {})
        }

        LogHelper.info("Ассеты успешно загружены!")
        App.getCommandsManager().console.resume()
    }

    /**
     * Скачивание файла с зеркала
     * @param url - Объект Url, содержащий ссылку на файл
     * @returns Promise который вернёт название временного файла в случае успеха
     */
    downloadFile(url: URL): Promise<string> {
        return new Promise((resolve, reject) => {
            const handler = url.protocol === "https:" ? https : http
            const tempFilename = path.resolve(StorageHelper.tempDir, randomBytes(16).toString("hex"))
            const tempFile = fs.createWriteStream(tempFilename)
            tempFile.on("close", () => {
                resolve(tempFilename)
            })

            handler
                .get(url, (res) => {
                    res.pipe(
                        ProgressHelper.getDownloadProgressBar({
                            length: parseInt(res.headers["content-length"], 10),
                        })
                    ).pipe(tempFile)
                })
                .on("error", (err) => {
                    fs.unlinkSync(tempFilename)
                    reject(err)
                })
        })
    }

    /**
     * Проверка наличия файла на зеркале
     * @param url - Объект Url, содержащий ссылку на файл
     * @returns Promise который вернёт `true` в случае существования файла или `false` при его отсутствии или ошибке
     */
    existFile(url: URL): Promise<boolean> {
        return new Promise((resolve) => {
            const handler = url.protocol === "https:" ? https : http
            handler
                .request(url, { method: "HEAD" }, (res) => {
                    return new RegExp(/2[\d]{2}/).test(res.statusCode.toString()) ? resolve(true) : resolve(false)
                })
                .on("error", (err) => {
                    LogHelper.error(err)
                    resolve(false)
                })
                .end()
        })
    }
}
