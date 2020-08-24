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

export class MirrorManager {
    /**
     * Скачивание клиена с зеркала
     * @param clientName - Название архива с файлами клиента
     * @param dirName - Название конечной папки
     */
    async downloadClient(clientName: string, dirName: string) {
        const mirrors: string[] = App.ConfigManager.getProperty("updatesUrl")
        const clientDir = path.resolve(StorageHelper.updatesDir, dirName)
        if (fs.existsSync(clientDir)) return LogHelper.error(App.LangManager.getTranslate("MirrorManager.dirExist"))
        const existClients: Map<number, string> = new Map()

        await Promise.all(
            mirrors.map(async (mirror, i) => {
                if (
                    (await this.existFile(new URL(`/clients/${clientName}.json`, mirror))) &&
                    (await this.existFile(new URL(`/clients/${clientName}.zip`, mirror)))
                )
                    existClients.set(i, mirror)
            })
        )

        if (existClients.size == 0)
            return LogHelper.error(App.LangManager.getTranslate("MirrorManager.client.notFound"))

        const mirror = existClients.values().next().value
        let profile: string
        let client: string

        try {
            LogHelper.info(App.LangManager.getTranslate("MirrorManager.client.download"))
            profile = await this.downloadFile(new URL(`/clients/${clientName}.json`, mirror))
            client = await this.downloadFile(new URL(`/clients/${clientName}.zip`, mirror))
        } catch (error) {
            LogHelper.error(App.LangManager.getTranslate("MirrorManager.client.downloadErr"))
            LogHelper.debug(error)
            return
        }

        fs.copyFileSync(profile, path.resolve(StorageHelper.profilesDir, `${dirName}.json`))
        try {
            fs.mkdirSync(clientDir)
            LogHelper.info(App.LangManager.getTranslate("MirrorManager.client.unpacking"))
            await ZipHelper.unzipArchive(client, clientDir)
        } catch (error) {
            fs.rmdirSync(clientDir)
            LogHelper.error(App.LangManager.getTranslate("MirrorManager.client.unpackingErr"))
            LogHelper.debug(error)
            return
        } finally {
            rimraf(path.resolve(StorageHelper.tempDir, "*"), () => {})
        }

        LogHelper.info(App.LangManager.getTranslate("MirrorManager.client.success"))
    }

    /**
     * Скачивание ассетов с зеркала
     * @param assetsName - Название архива с файлами ассетов
     * @param dirName - Название конечной папки
     */
    async downloadAssets(assetsName: string, dirName: string) {
        const mirrors: string[] = App.ConfigManager.getProperty("updatesUrl")
        const assetsDir = path.resolve(StorageHelper.updatesDir, dirName)
        if (fs.existsSync(assetsDir)) return LogHelper.error(App.LangManager.getTranslate("MirrorManager.dirExist"))
        const existAssets: Map<number, string> = new Map()

        await Promise.all(
            mirrors.map(async (mirror, i) => {
                if (await this.existFile(new URL(`/assets/${assetsName}.zip`, mirror))) existAssets.set(i, mirror)
            })
        )

        if (existAssets.size == 0) return LogHelper.error(App.LangManager.getTranslate("MirrorManager.assets.notFound"))

        const mirror = existAssets.values().next().value
        let assets: string

        try {
            LogHelper.info(App.LangManager.getTranslate("MirrorManager.assets.download"))
            assets = await this.downloadFile(new URL(`/assets/${assetsName}.zip`, mirror))
        } catch (error) {
            LogHelper.error(App.LangManager.getTranslate("MirrorManager.assets.downloadErr"))
            LogHelper.debug(error)
            return
        }

        try {
            fs.mkdirSync(assetsDir)
            LogHelper.info(App.LangManager.getTranslate("MirrorManager.assets.unpacking"))
            await ZipHelper.unzipArchive(assets.toString(), assetsDir)
        } catch (error) {
            fs.rmdirSync(assetsDir)
            LogHelper.error(App.LangManager.getTranslate("MirrorManager.assets.unpackingErr"))
            LogHelper.debug(error)
            return
        } finally {
            rimraf(path.resolve(StorageHelper.tempDir, "*"), () => {})
        }

        LogHelper.info(App.LangManager.getTranslate("MirrorManager.assets.success"))
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
                    new RegExp(/2[\d]{2}/).test(res.statusCode.toString()) ? resolve(true) : resolve(false)
                })
                .on("error", (err) => {
                    LogHelper.error(err)
                    resolve(false)
                })
                .end()
        })
    }
}
