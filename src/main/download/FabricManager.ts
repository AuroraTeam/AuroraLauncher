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

import * as download from "mvn-artifact-download"
import * as rimraf from "rimraf"

import { LogHelper } from "../helpers/LogHelper"
import { StorageHelper } from "../helpers/StorageHelper"
import { ZipHelper } from "../helpers/ZipHelper"
import { App } from "../LauncherServer"
import { ClientProfileConfig } from "../profiles/ProfileConfig"
import { MojangManager } from "./MojangManager"

export class FabricManager extends MojangManager {
    /**
     * Скачивание клиента с зеркала Mojang
     * @param clientVer - Версия клиента
     * @param dirName - Название конечной папки
     */
    async downloadClient(clientVer: string, dirName: string): Promise<void> {
        const fabricVersion: any = await this.getFabricVersionInfo(clientVer)
        if (fabricVersion === undefined) return

        const mojangVersion: any = await this.getVersionInfo(clientVer)
        if (mojangVersion === undefined) return

        const client: any = mojangVersion.downloads.client
        const libraries: any[] = mojangVersion.libraries

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

        LogHelper.info("Download Fabric libraries, please wait...")
        const librariesListFabric = this.librariesParseFabric(fabricVersion.libraries)

        //Хз мб говно, но вроде работает
        await Promise.all(
            Array.from(librariesListFabric.libraries).map(async (lib) => {
                // TODO Поменять :)
                //Скачивается тупо в папку с библиотеками....
                download.default(lib, librariesDir, "https://maven.fabricmc.net/")
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
            assetsDir: `assets${mojangVersion.assets}`,
            assetsIndex: mojangVersion.assets,
            mainClass: fabricVersion.mainClass,
        } as ClientProfileConfig)
        LogHelper.info("Done")
    }

    /**
     * @param libraries Объект со списком библиотек от Fabric
     */
    librariesParseFabric(libraries: any[]): { libraries: Set<string> } {
        const filteredData = {
            libraries: new Set() as Set<string>,
        }
        libraries.forEach((lib) => {
            filteredData.libraries.add(lib.name)
        })

        return filteredData
    }

    async getFabricVersionInfo(version: string): Promise<any> {
        let loadersData
        try {
            loadersData = await this.readFile(`https://meta.fabricmc.net/v2/versions/loader/${version}`)
        } catch (error) {
            LogHelper.debug(error)
            LogHelper.error("FabricMC site unavailable")
            return
        }

        let loaders: any[]
        try {
            loaders = JSON.parse(loadersData)
        } catch (error) {
            LogHelper.debug(error)
            LogHelper.error("Error parsing JSON data")
            return
        }

        //Не мы такие, жизнь такая...
        if (loaders.length === 0) {
            LogHelper.error("Version %s not found", version)
            return
        }

        const data = loaders.find((data: any) => data.loader.stable === true)

        let versionData
        try {
            versionData = await this.readFile(
                `https://meta.fabricmc.net/v2/versions/loader/${version}/${data.loader.version}/profile/json`
            )
        } catch (error) {
            LogHelper.debug(error)
            LogHelper.error("FabricMC site unavailable") // TODO Поменять
            return
        }

        try {
            return JSON.parse(versionData)
        } catch (error) {
            LogHelper.debug(error)
            return
        }
    }
}
