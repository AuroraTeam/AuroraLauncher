import * as fs from "fs"
import * as path from "path"
import * as http from "http"
import * as https from "https"
import { randomBytes } from "crypto"
import { App } from "../LauncherServer"
import { StorageHelper } from "../helpers/StorageHelper"
import { LogHelper } from "../helpers/LogHelper"
import { URL } from "url"
import * as decompress from "decompress"
import * as rimraf from "rimraf"

// TODO Реализовать работу с http2
// TODO dev logs
export class MirrorManager {

    async downloadClient(clientName: string, dirName: string) {
        const mirrors: string[] = App.ConfigManager.getProperty('updatesUrl')
        const clientDir = path.resolve(StorageHelper.updatesDir, dirName)

        if (fs.existsSync(clientDir)) return LogHelper.error('Папка клиента с таким названием уже существует!')

        const existClients: Map<number, string> = new Map

        App.CommandsManager.console.pause()
        await Promise.all( // async mirror check
            mirrors.map(async (mirror, i) => {
                const json = new URL(`/clients/${clientName}.json`, mirror)
                const zip = new URL(`/clients/${clientName}.zip`, mirror)
                if (await this.existFile(json) && await this.existFile(zip)) {
                    existClients.set(i, mirror)
                }
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
            profile = await this.downloadFile(new URL(`/clients/${clientName}.json`, mirror))
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

    downloadAssets() {
        const mirrors = App.ConfigManager.getProperty('updatesUrl')
        console.log(mirrors)
    }

    downloadFile(url: URL): Promise<string> {
        const handler = url.protocol === "https:" ? https : http
        const tempFilename = path.resolve(StorageHelper.tempDir, randomBytes(16).toString("hex"))
        const tempFile = fs.createWriteStream(tempFilename)
        return new Promise((resolve, reject) => {
            handler.get(url, res => {
                res.pipe(tempFile)
                // res.on('data', (chunk) => {
                //     console.log(chunk)
                // })
                res.on('end', () => {
                    resolve(tempFilename)
                });
            }).on('error', (err) => {
                fs.unlinkSync(tempFilename)
                reject(err)
            })
        })
    }

    existFile(url: URL): Promise<boolean> {
        const handler = url.protocol === "https:" ? https : http
        return new Promise((resolve) => {
            handler.request(url, {method: 'HEAD'}, res => {
                return new RegExp(/2[\d]{2}/).test(res.statusCode.toString())
                    ? resolve(true)
                    : resolve(false)
            }).on('error', (err) => {
                LogHelper.error(err)
                resolve(false)
            }).end()
        })
    }
}