import { randomBytes } from "crypto"
import * as fs from "fs"
import * as http from "http"
import * as https from "https"
import * as path from "path"
import { URL } from "url"

import * as decompress from "decompress"
import * as rimraf from "rimraf"

import { LogHelper } from "../helpers/LogHelper"
import { ProgressBarHelper } from "../helpers/ProgressBarHelper"
import { StorageHelper } from "../helpers/StorageHelper"
import { App } from "../LauncherServer"

// TODO Реализовать работу с http2
// TODO dev logs
// TODO Рефакторнуть это говно, выглядит страшно
export class MirrorManager {
    async downloadClient(clientName: string, dirName: string) {
        const mirrors: string[] = App.ConfigManager.getProperty("updatesUrl")
        const clientDir = path.resolve(StorageHelper.updatesDir, dirName)
        if (fs.existsSync(clientDir)) return LogHelper.error("Папка с таким названием уже существует!")
        const existClients: Map<number, string> = new Map()

        App.CommandsManager.console.pause()
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
            App.CommandsManager.console.resume()
            return
        }

        const mirror = existClients.get(0)
        let profile: string
        let client: string

        try {
            LogHelper.info("Клиент найден, загрузка...")
            profile = await this.downloadFile(new URL(`/clients/${clientName}.json`, mirror), false)
            client = await this.downloadFile(new URL(`/clients/${clientName}.zip`, mirror))
        } catch (error) {
            LogHelper.error("Ошибка при загрузке клиента!")
            LogHelper.debug(error)
            App.CommandsManager.console.resume()
            return
        }

        fs.copyFileSync(profile.toString(), path.resolve(StorageHelper.profilesDir, `${dirName}.json`))
        try {
            fs.mkdirSync(clientDir)
            await decompress(client.toString(), clientDir)
        } catch (error) {
            fs.rmdirSync(clientDir)
            LogHelper.error("Ошибка при распаковке клиента!")
            LogHelper.debug(error)
            App.CommandsManager.console.resume()
            return
        } finally {
            rimraf(path.resolve(StorageHelper.tempDir, "*"), () => {})
        }

        LogHelper.info("Клиент успешно загружен!")
        App.CommandsManager.console.resume()
    }

    async downloadAssets(assetsName: string, dirName: string) {
        const mirrors: string[] = App.ConfigManager.getProperty("updatesUrl")
        const assetsDir = path.resolve(StorageHelper.updatesDir, dirName)
        if (fs.existsSync(assetsDir)) return LogHelper.error("Папка с таким названием уже существует!")
        const existAssets: Map<number, string> = new Map()

        App.CommandsManager.console.pause()
        await Promise.all(
            // async mirror check
            mirrors.map(async (mirror, i) => {
                if (await this.existFile(new URL(`/assets/${assetsName}.zip`, mirror))) existAssets.set(i, mirror)
            })
        )

        if (existAssets.size == 0) {
            LogHelper.error(`Ассеты не найдены!`)
            App.CommandsManager.console.resume()
            return
        }

        const mirror = existAssets.get(0)
        let assets: string

        try {
            LogHelper.info("Ассеты найдены, загрузка...")
            assets = await this.downloadFile(new URL(`/assets/${assetsName}.zip`, mirror))
        } catch (error) {
            LogHelper.error("Ошибка при загрузке ассетов!")
            LogHelper.debug(error)
            App.CommandsManager.console.resume()
            return
        }

        try {
            fs.mkdirSync(assetsDir)
            await decompress(assets.toString(), assetsDir)
        } catch (error) {
            fs.rmdirSync(assetsDir)
            LogHelper.error("Ошибка при распаковке ассетов!")
            LogHelper.debug(error)
            App.CommandsManager.console.resume()
            return
        } finally {
            rimraf(path.resolve(StorageHelper.tempDir, "*"), () => {})
        }

        LogHelper.info("Ассеты успешно загружены!")
        App.CommandsManager.console.resume()
    }

    downloadFile(url: URL, showProgress: boolean = true): Promise<string> {
        const handler = url.protocol === "https:" ? https : http
        const tempFilename = path.resolve(StorageHelper.tempDir, randomBytes(16).toString("hex"))
        const tempFile = fs.createWriteStream(tempFilename)

        return new Promise((resolve, reject) => {
            handler
                .get(url, (res) => {
                    res.pipe(tempFile)
                    if (showProgress) {
                        let downloaded = 0
                        const progressBar = ProgressBarHelper.getProgressBar()
                        progressBar.start(parseInt(res.headers["content-length"], 10), 0)
                        res.on("data", (chunk) => {
                            downloaded += chunk.length
                            progressBar.update(downloaded)
                        })
                        res.on("end", () => {
                            progressBar.stop()
                        })
                    }
                    res.on("end", () => {
                        resolve(tempFilename)
                    })
                })
                .on("error", (err) => {
                    fs.unlinkSync(tempFilename)
                    reject(err)
                })
        })
    }

    existFile(url: URL): Promise<boolean> {
        const handler = url.protocol === "https:" ? https : http
        return new Promise((resolve) => {
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
