// TODO Ещё больше try/catch для отлова возможных ошибок

import fs from "fs"
import path from "path"
import { URL } from "url"

import { JsonHelper } from "@auroralauncher/core"
import { HttpHelper, LogHelper, StorageHelper, ZipHelper } from "@root/helpers"
import { App } from "@root/LauncherServer"
import { ProfileConfig } from "@root/profiles/types/ProfileConfig"
import rimraf from "rimraf"

export class MojangManager {
    clientsLink = "https://libraries.minecraft.net/"
    assetsLink = "https://resources.download.minecraft.net/"
    versionManifestLink = "https://launchermeta.mojang.com/mc/game/version_manifest.json"

    /**
     * Скачивание клиента с зеркала Mojang
     * @param clientVer - Версия клиента
     * @param dirName - Название конечной папки
     * @param modloader
     */
    async downloadClient(clientVer: string, dirName: string, modloader = false): Promise<any> {
        const version: any = await this.getVersionInfo(clientVer)
        if (version === undefined) return

        const client: any = version.downloads.client
        const libraries: any[] = version.libraries

        // Client
        const clientDir = path.resolve(StorageHelper.instancesDir, dirName)
        if (fs.existsSync(clientDir)) return LogHelper.error(App.LangManager.getTranslate.DownloadManager.dirExist)
        fs.mkdirSync(clientDir)
        try {
            LogHelper.info(App.LangManager.getTranslate.DownloadManager.MojangManager.client.download)
            await HttpHelper.downloadFile(new URL(client.url), path.resolve(clientDir, "minecraft.jar"))
        } catch (error) {
            LogHelper.error(App.LangManager.getTranslate.DownloadManager.MojangManager.client.downloadErr)
            LogHelper.debug(error)
            return
        }

        // Libraries
        const librariesDir = path.resolve(clientDir, "libraries")
        fs.mkdirSync(librariesDir)

        LogHelper.info(App.LangManager.getTranslate.DownloadManager.MojangManager.libraries.download)
        const librariesList = this.librariesParse(libraries)

        try {
            await HttpHelper.downloadFiles(librariesList.libraries, this.clientsLink, librariesDir)
        } catch (error) {
            LogHelper.error(App.LangManager.getTranslate.DownloadManager.MojangManager.libraries.downloadErr)
            LogHelper.debug(error)
            return
        }

        // Natives
        const nativesDir = path.resolve(clientDir, "natives")
        fs.mkdirSync(nativesDir)
        try {
            LogHelper.info(App.LangManager.getTranslate.DownloadManager.MojangManager.natives.download)
            await HttpHelper.downloadFiles(
                librariesList.natives,
                this.clientsLink,
                StorageHelper.tempDir,
                (filePath) => {
                    ZipHelper.unzipArchive(filePath, nativesDir, [".dll", ".so", ".dylib", ".jnilib"])
                }
            )
        } catch (error) {
            LogHelper.error(App.LangManager.getTranslate.DownloadManager.MojangManager.natives.downloadErr)
            LogHelper.debug(error)
            return
        }
        rimraf(path.resolve(StorageHelper.tempDir, "*"), (e) => {
            if (e !== null) LogHelper.warn(e)
        })

        if (!modloader) LogHelper.info(App.LangManager.getTranslate.DownloadManager.MojangManager.client.success)

        //Profiles
        return App.ProfilesManager.createProfile({
            version: clientVer,
            clientDir: dirName,
            mainClass: version.mainClass,
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

        const assetsDir = path.resolve(StorageHelper.instancesDir, dirName)
        if (fs.existsSync(assetsDir)) return LogHelper.error(App.LangManager.getTranslate.DownloadManager.dirExist)
        fs.mkdirSync(assetsDir)

        const assetsFile = await HttpHelper.getResource(new URL(version.assetIndex.url))
        fs.mkdirSync(path.resolve(assetsDir, "indexes"))
        fs.writeFileSync(path.resolve(assetsDir, `indexes/${version.assets}.json`), assetsFile)

        const { objects: assetsData } = JsonHelper.fromJson<any>(assetsFile)
        const assetsHashes: Set<string> = new Set()
        for (const key in assetsData) {
            const hash = assetsData[key].hash
            assetsHashes.add(`${hash.slice(0, 2)}/${hash}`)
        }

        LogHelper.info(App.LangManager.getTranslate.DownloadManager.MojangManager.assets.download)
        try {
            await HttpHelper.downloadFiles(assetsHashes, this.assetsLink, path.resolve(assetsDir, "objects"))
        } catch (error) {
            LogHelper.error(App.LangManager.getTranslate.DownloadManager.MojangManager.assets.downloadErr)
            LogHelper.debug(error)
            return
        }
        LogHelper.info(App.LangManager.getTranslate.DownloadManager.MojangManager.assets.success)
    }

    // TODO Отрефакторить этот прикол
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
                const natives = <any[]>Object.values(lib.natives)

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
            versionsData = await HttpHelper.getResource(new URL(this.versionManifestLink))
        } catch (error) {
            LogHelper.debug(error)
            LogHelper.error(App.LangManager.getTranslate.DownloadManager.MojangManager.info.unavailableSite)
            return
        }

        let versions: any[]
        try {
            versions = JsonHelper.fromJson<any>(versionsData).versions
        } catch (error) {
            LogHelper.debug(error)
            LogHelper.error(App.LangManager.getTranslate.DownloadManager.MojangManager.info.errVerParsing)
            return
        }

        const _version = versions.find((v: any) => v.id === version)
        if (_version === undefined) {
            LogHelper.error(App.LangManager.getTranslate.DownloadManager.MojangManager.info.verNotFound, version)
            return
        }

        let clientData
        try {
            clientData = await HttpHelper.getResource(new URL(_version.url))
        } catch (error) {
            LogHelper.debug(error)
            LogHelper.error(App.LangManager.getTranslate.DownloadManager.MojangManager.info.clientDataNotFound)
            return
        }

        try {
            return JsonHelper.fromJson(clientData)
        } catch (error) {
            LogHelper.debug(error)
            LogHelper.error(App.LangManager.getTranslate.DownloadManager.MojangManager.info.errClientParsing)
            return
        }
    }
}
