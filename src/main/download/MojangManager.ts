/**
 * AuroraLauncher LauncherServer - Server for AuroraLauncher
 * Copyright (C) 2020 - 2021 AuroraTeam

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// TODO Ещё больше try/catch для отлова возможных ошибок
// TODO Перевод

import { randomBytes } from "crypto"
import * as fs from "fs"
import * as https from "https"
import * as path from "path"
import { URL } from "url"

import * as pMap from "p-map"
import * as rimraf from "rimraf"

import { LogHelper } from "../helpers/LogHelper"
import { ProgressHelper } from "../helpers/ProgressHelper"
import { StorageHelper } from "../helpers/StorageHelper"
import { App } from "../LauncherServer"

export class MojangManager {
    // TODO Профили

    /**
     * Скачивание клиена с зеркала Mojang
     * @param clientVer - Версия клиента
     * @param dirName - Название конечной папки
     */
    async downloadClient(clientVer: string, dirName: string): Promise<void> {
        const version: any = await this.getVersionInfo(clientVer)
        if (version === undefined) return

        const client: any = version.downloads.client
        const libraries: any[] = version.libraries

        // Client
        const clientDir = path.resolve(StorageHelper.updatesDir, dirName)
        if (fs.existsSync(clientDir)) return LogHelper.error(App.LangManager.getTranslate("MirrorManager.dirExist"))
        fs.mkdirSync(clientDir)

        const clientFile = await this.downloadFile(new URL(client.url))
        fs.copyFileSync(clientFile, path.resolve(clientDir, "minecraft.jar"))

        // Libraries
        const librariesDir = path.resolve(clientDir, "libraries")
        fs.mkdirSync(librariesDir)

        LogHelper.info("Download libraries and natives")
        await pMap(
            libraries,
            async (lib) => {
                if (lib.rules !== undefined) {
                    const rules = {
                        allow: [] as string[],
                        disallow: [] as string[],
                    }

                    lib.rules.forEach((rule: { action: "allow" | "disallow"; os: any }) => {
                        if (rule.os !== undefined) rules[rule.action].push(rule.os.name)
                    })

                    // Выкидываем ненужные либы lwjgl
                    if (rules.disallow.includes("osx") && (lib.name as string).includes("lwjgl")) return
                }

                if (lib.downloads.artifact !== undefined) {
                    const libFile = await this.downloadFile(new URL(lib.downloads.artifact.url), false)
                    fs.mkdirSync(path.resolve(librariesDir, path.dirname(lib.downloads.artifact.path)), {
                        recursive: true,
                    })
                    fs.copyFileSync(libFile, path.resolve(librariesDir, lib.downloads.artifact.path))
                }

                // TODO Распаковка нативок
                // Natives
                if (lib.natives !== undefined) {
                    const nativesDir = path.resolve(clientDir, "natives")
                    if (!fs.existsSync(nativesDir)) fs.mkdirSync(nativesDir)

                    const natives = []
                    for (const key in lib.natives) {
                        natives.push(lib.natives[key])
                    }

                    for (const native of natives) {
                        const nativeData: any = lib.downloads.classifiers[native]

                        const nativeFile = await this.downloadFile(new URL(nativeData.url), false)
                        fs.copyFileSync(nativeFile, path.resolve(nativesDir, path.basename(nativeData.path)))
                    }
                }
            },
            { concurrency: 4 }
        )
        // Не потоки конечно, но хоть что-то

        rimraf(path.resolve(StorageHelper.tempDir, "*"), (e) => {
            if (e !== null) LogHelper.warn(e)
        })

        LogHelper.info("Done")
    }

    /**
     * Скачивание клиена с зеркала Mojang
     * @param assetsVer - Версия клиента
     * @param dirName - Название конечной папки
     */
    async downloadAssets(assetsVer: string, dirName: string): Promise<void> {
        const version: any = await this.getVersionInfo(assetsVer)
        if (version === undefined) return

        const assetsDir = path.resolve(StorageHelper.updatesDir, dirName)
        if (fs.existsSync(assetsDir)) return LogHelper.error(App.LangManager.getTranslate("MirrorManager.dirExist"))
        fs.mkdirSync(assetsDir)

        const assetsFile = await this.downloadFile(new URL(version.assetIndex.url))
        fs.mkdirSync(path.resolve(assetsDir, "indexes"))
        const json = path.resolve(assetsDir, `indexes/${assetsVer}.json`)
        fs.copyFileSync(assetsFile, json)

        const assetsData = JSON.parse(fs.readFileSync(json).toString()).objects

        const assetsHashes = []

        for (const key in assetsData) {
            assetsHashes.push(assetsData[key].hash)
        }

        LogHelper.info("Download assets")
        // TODO ProgressBar по количеству файлов или по размеру
        await pMap(
            assetsHashes,
            async (hash) => {
                const assetFile = await this.downloadFile(
                    new URL(`${hash.slice(0, 2)}/${hash}`, "https://resources.download.minecraft.net/"),
                    false
                )

                const assetDir = path.resolve(assetsDir, `objects/${hash.slice(0, 2)}`)
                if (!fs.existsSync(assetDir)) fs.mkdirSync(assetDir, { recursive: true })
                fs.copyFileSync(assetFile, path.resolve(assetDir, hash))
            },
            { concurrency: 4 }
        )
        // Не потоки конечно, но хоть что-то

        rimraf(path.resolve(StorageHelper.tempDir, "*"), (e) => {
            if (e !== null) LogHelper.warn(e)
        })

        LogHelper.info("Done")
    }

    /**
     * Скачивание файла с зеркала с зеркала Mojang (https only)
     * @param url - Объект Url, содержащий ссылку на файл
     * @returns Promise который вернёт название временного файла в случае успеха
     */
    downloadFile(url: URL, showProgress = true): Promise<string> {
        return new Promise((resolve, reject) => {
            const tempFilename = path.resolve(StorageHelper.tempDir, randomBytes(16).toString("hex"))
            const tempFile = fs.createWriteStream(tempFilename)
            tempFile.on("close", () => {
                resolve(tempFilename)
            })

            https
                .get(url, (res) => {
                    if (showProgress) {
                        res.pipe(
                            ProgressHelper.getDownloadProgressBar({
                                length: parseInt(res.headers["content-length"], 10),
                            })
                        ).pipe(tempFile)
                    } else {
                        res.pipe(tempFile)
                    }
                })
                .on("error", (err) => {
                    fs.unlinkSync(tempFilename)
                    reject(err)
                })
        })
    }

    /**
     * Просмотр файла (https only)
     * @param url - Ссылка на файл
     * @returns Promise который вернёт содержимое файла в случае успеха
     */
    readFile(url: string): Promise<string> {
        return new Promise(function (resolve, reject) {
            https
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

    async getVersionInfo(version: string): Promise<any> {
        let versionsData
        try {
            versionsData = await this.readFile("https://launchermeta.mojang.com/mc/game/version_manifest.json")
        } catch (error) {
            LogHelper.debug(error)
            LogHelper.error("Mojang site unavailable")
            return
        }

        let versions
        try {
            versions = JSON.parse(versionsData).versions
        } catch (error) {
            LogHelper.debug(error)
            LogHelper.error("Error parsing JSON data")
            return
        }

        const _version = versions.find((v: any) => v.id === version)
        if (_version === undefined) {
            LogHelper.error("Version %s not found", version)
            return
        }

        try {
            return JSON.parse(await this.readFile(_version.url))
        } catch (error) {
            LogHelper.debug(error)
            return
        }
    }
}
