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
import * as path from "path"
import { URL } from "url"

import rimraf from "rimraf"

import { HttpHelper } from "../helpers/HttpHelper"
import { JsonHelper } from "../helpers/JsonHelper"
import { LogHelper } from "../helpers/LogHelper"
import { StorageHelper } from "../helpers/StorageHelper"
import { ZipHelper } from "../helpers/ZipHelper"
import { App } from "../LauncherServer"
import { ProfileConfig } from "../profiles/types/ProfileConfig"

export class MojangManager {
    clientsLink = "https://libraries.minecraft.net/"
    assetsLink = "https://resources.download.minecraft.net/"
    versionManifestLink = "https://launchermeta.mojang.com/mc/game/version_manifest.json"

    /**
     * Скачивание клиента с зеркала Mojang
     * @param clientVer - Версия клиента
     * @param dirName - Название конечной папки
     */
    async downloadClient(clientVer: string, dirName: string, modloader = false): Promise<any> {
        const version: any = await this.getVersionInfo(clientVer)
        if (version === undefined) return

        const client: any = version.downloads.client
        const libraries: any[] = version.libraries

        // Client
        const clientDir = path.resolve(StorageHelper.updatesDir, dirName)
        if (fs.existsSync(clientDir)) return LogHelper.error(App.LangManager.getTranslate().MirrorManager.dirExist)
        fs.mkdirSync(clientDir)

        await HttpHelper.downloadFile(new URL(client.url), path.resolve(clientDir, "minecraft.jar"))

        // Libraries
        const librariesDir = path.resolve(clientDir, "libraries")
        fs.mkdirSync(librariesDir)

        LogHelper.info("Download libraries and natives, please wait...")
        const librariesList = this.librariesParse(libraries)

        await HttpHelper.downloadFiles(librariesList.libraries, this.clientsLink, librariesDir)

        // Natives
        const nativesDir = path.resolve(clientDir, "natives")
        fs.mkdirSync(nativesDir)

        await HttpHelper.downloadFiles(librariesList.natives, this.clientsLink, StorageHelper.tempDir, (filePath) => {
            ZipHelper.unzipArchive(filePath, nativesDir, [".dll", ".so", ".dylib", ".jnilib"])
        })
        rimraf(path.resolve(StorageHelper.tempDir, "*"), (e) => {
            if (e !== null) LogHelper.warn(e)
        })

        if (!modloader) LogHelper.info("Done")

        //Profiles
        return App.ProfilesManager.createProfile({
            version: clientVer,
            clientDir: dirName,
            assetsDir: `assets${version.assets}`,
            assetsIndex: version.assets,
            servers: [
                {
                    title: dirName,
                },
            ],
        } as ProfileConfig)
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
        if (fs.existsSync(assetsDir)) return LogHelper.error(App.LangManager.getTranslate().MirrorManager.dirExist)
        fs.mkdirSync(assetsDir)

        const assetsFile = await HttpHelper.readFile(new URL(version.assetIndex.url))
        fs.mkdirSync(path.resolve(assetsDir, "indexes"))
        fs.writeFileSync(path.resolve(assetsDir, `indexes/${version.assets}.json`), assetsFile)

        const assetsData = JsonHelper.fromJSON(assetsFile).objects
        const assetsHashes: Set<string> = new Set()
        for (const key in assetsData) {
            const hash = assetsData[key].hash
            assetsHashes.add(`${hash.slice(0, 2)}/${hash}`)
        }

        LogHelper.info("Download assets, please wait...")
        await HttpHelper.downloadFiles(assetsHashes, this.assetsLink, path.resolve(assetsDir, "objects"))
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

    async getVersionInfo(version: string): Promise<any> {
        let versionsData
        try {
            versionsData = await HttpHelper.readFile(new URL(this.versionManifestLink))
        } catch (error) {
            LogHelper.debug(error)
            LogHelper.error("Mojang site unavailable")
            return
        }

        let versions
        try {
            versions = JsonHelper.fromJSON(versionsData).versions
        } catch (error) {
            LogHelper.debug(error)
            LogHelper.error("Error parsing versions data")
            return
        }

        const _version = versions.find((v: any) => v.id === version)
        if (_version === undefined) {
            LogHelper.error("Version %s not found", version)
            return
        }

        let clientData
        try {
            clientData = await HttpHelper.readFile(new URL(_version.url))
        } catch (error) {
            LogHelper.debug(error)
            LogHelper.error("Client data not found")
            return
        }

        try {
            return JsonHelper.fromJSON(clientData)
        } catch (error) {
            LogHelper.debug(error)
            LogHelper.error("Error parsing client data")
            return
        }
    }
}
