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

import * as fs from "fs"
import * as https from "https"
import * as path from "path"
import { URL } from "url"

import * as pMap from "p-map"
import * as rimraf from "rimraf"

import { JsonHelper } from "../helpers/JSONHelper"
import { LogHelper } from "../helpers/LogHelper"
import { ProgressHelper } from "../helpers/ProgressHelper"
import { StorageHelper } from "../helpers/StorageHelper"
import { ZipHelper } from "../helpers/ZipHelper"
import { App } from "../LauncherServer"
import { ClientProfileConfig } from "../profiles/ProfileConfig"
import { DownloadManager } from "./DownloadManager"

export class MojangManager extends DownloadManager {
    /**
     * Скачивание клиента с зеркала Mojang
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

        LogHelper.info("Download libraries and natives, please wait...")
        const librariesList = this.librariesParse(libraries)

        await Promise.all(
            Array.from(librariesList.libraries).map(async (lib) => {
                const libFile = await this.downloadFile(new URL(lib, "https://libraries.minecraft.net/"), false)
                fs.mkdirSync(path.resolve(librariesDir, path.dirname(lib)), { recursive: true })
                fs.copyFileSync(libFile, path.resolve(librariesDir, lib))
            })
        )

        // Natives
        const nativesDir = path.resolve(clientDir, "natives")
        fs.mkdirSync(nativesDir)

        await Promise.all(
            Array.from(librariesList.natives).map(async (native) => {
                const nativeFile = await this.downloadFile(new URL(native, "https://libraries.minecraft.net/"), false)
                await ZipHelper.unzipArchive(nativeFile, nativesDir, [".dll", ".so", ".dylib", ".jnilib"])
            })
        )

        rimraf(path.resolve(StorageHelper.tempDir, "*"), (e) => {
            if (e !== null) LogHelper.warn(e)
        })

        //Profiles
        App.ProfilesManager.createProfile({
            version: clientVer,
            clientDir: dirName,
            assetsDir: `assets${version.assets}`,
            assetsIndex: version.assets,
        } as ClientProfileConfig)
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

        const assetsFile = await this.downloadFile(new URL(version.assetIndex.url), false)
        fs.mkdirSync(path.resolve(assetsDir, "indexes"))
        const json = path.resolve(assetsDir, `indexes/${assetsVer}.json`)
        fs.copyFileSync(assetsFile, json)

        const assetsData = JsonHelper.toJSON(fs.readFileSync(json).toString()).objects

        const assetsHashes: Map<string, number> = new Map()

        for (const key in assetsData) {
            assetsHashes.set(assetsData[key].hash, assetsData[key].size)
        }

        const totalSize = version.assetIndex.totalSize
        let downloaded = 0

        LogHelper.info("Download assets, please wait...")
        const progress = ProgressHelper.getLoadingProgressBar()
        await pMap(
            assetsHashes,
            async ([hash, size]) => {
                const assetFile = await this.downloadFile(
                    new URL(`${hash.slice(0, 2)}/${hash}`, "https://resources.download.minecraft.net/"),
                    false
                )

                const assetDir = path.resolve(assetsDir, `objects/${hash.slice(0, 2)}`)
                if (!fs.existsSync(assetDir)) fs.mkdirSync(assetDir, { recursive: true })
                fs.copyFileSync(assetFile, path.resolve(assetDir, hash))

                downloaded += size
                progress.emit("progress", {
                    percentage: (downloaded / totalSize) * 100,
                })
            },
            { concurrency: 64 }
        )
        progress.emit("end")

        rimraf(path.resolve(StorageHelper.tempDir, "*"), (e) => {
            if (e !== null) LogHelper.warn(e)
        })

        LogHelper.info("Done")
    }

    /**
     * Получить список библиотек и нативных файлов для скачивания
     * @param libraries Объект со списком библиотек и нативных файлов
     */
    librariesParse(libraries: any[]): { libraries: Set<string>; natives: Set<string> } {
        const filteredData = {
            libraries: new Set() as Set<string>,
            natives: new Set() as Set<string>,
        }

        libraries.forEach((lib) => {
            const rules = {
                allow: [] as string[],
                disallow: [] as string[],
            }

            if (lib.rules !== undefined) {
                lib.rules.forEach((rule: { action: "allow" | "disallow"; os: any }) => {
                    if (rule.os !== undefined) rules[rule.action].push(rule.os.name)
                })

                // Игнорируем ненужные либы lwjgl
                if ((lib.name as string).includes("lwjgl") && rules.disallow.includes("osx")) return
            }

            if (lib.downloads.artifact !== undefined) {
                filteredData.libraries.add(lib.downloads.artifact.path)
            }

            // Natives
            if (lib.natives !== undefined) {
                const natives = []
                for (const key in lib.natives) {
                    natives.push(lib.natives[key])
                }

                // Ещё один костыль для lwjgl
                if ((lib.name as string).includes("lwjgl") && rules.allow.includes("osx")) {
                    natives.push("natives-linux", "natives-windows")
                }

                // Костыль для твич либ
                // if (natives.includes('natives-windows-${arch}')) {
                //     natives.push("natives-windows-32")
                // }

                natives.forEach((native) => {
                    const nativeData = lib.downloads.classifiers[native]
                    if (nativeData === undefined) return
                    filteredData.natives.add(nativeData.path)
                })
            }
        })

        return filteredData
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
            versions = JsonHelper.toJSON(versionsData).versions
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
            return JsonHelper.toJSON(await this.readFile(_version.url))
        } catch (error) {
            LogHelper.debug(error)
            return
        }
    }
}
